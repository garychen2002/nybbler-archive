import "dotenv/config"; // env file in server directory

import { Worker } from "bullmq";
import { keyBy } from "lodash-es";
import { R2Pipe } from "r2pipe-promise";
import { CreationAttributes } from "sequelize";
import { sequelize } from "../datasource.js";
import { analyze_ghidra } from "../helpers/analyze.js";
import { initModels } from "./models/_init.js";
import { Binary } from "./models/binary.js";
import { Function } from "./models/function.js";
import { Symbol } from "./models/symbol.js";
import { RedisConnectionOptions } from "./shared.js";

(async () => {
  try {
    await sequelize.authenticate();
    initModels();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }

  new Worker(
    "Analysis",
    async ({ name, data }) => {
      console.log(`received job: ${name}`);

      switch (name) {
        case "Analyze":
          return handleAnalyze(data.binaryId);
        default:
          console.error(`no handler for job: ${name}`);
      }
    },
    { connection: RedisConnectionOptions },
  );

  console.log("Analysis worker started");
})();

async function handleAnalyze(binaryId: number | undefined) {
  if (binaryId === undefined) {
    return console.error(`binary analysis: ID of Binary record required`);
  }

  const binary = await Binary.findByPk(binaryId);
  if (!binary) {
    return console.error(`binary analysis: no Binary record with ID: ${binaryId}`);
  }

  const { symbols, instructions } = await analyze_ghidra(binary.file.path);
  if (!symbols || !instructions) {
    return console.error(`binary analysis: Ghidra analysis failed`);
  }

  const symbolsByAddress = keyBy(symbols, ({ address }) => address);
  const foundSymbols: Partial<Symbol>[] = instructions
    .filter(({ address }) => address in symbolsByAddress)
    .map(({ address }) => symbolsByAddress[address]);

  await Symbol.bulkCreate(
    foundSymbols.map(
      (symbol) => ({ ...symbol, binaryId: binary.id }) as CreationAttributes<Symbol>,
    ),
  );
  const symbolRecords = await (binary as any).getSymbols();
  const symbolRecordsByOffset = keyBy(symbolRecords, ({ address }) => Number.parseInt(address, 16));

  // Written with GPT help
  {
    // Open the binary file in Radare2
    //
    // NOTE(ian): This returns a promise so the await IS NECESSARY.
    //            r2pipe's type definitions are wrong.
    const r2 = await R2Pipe.open(binary.file.path);

    try {
      // Analyze the binary and all its functions
      await r2.cmd("aaa");

      // Get the list of functions
      const functionDumps = JSON.parse(await r2.cmd("aflj")).filter(
        (f: any) => symbolRecordsByOffset[f.offset],
      );

      await Function.bulkCreate(
        await Promise.all(
          functionDumps.map(async (f: any) => ({
            disassembly: await r2.cmd(`pdf @ ${f.offset}`),
            symbolId: symbolRecordsByOffset[f.offset].id,
          })),
        ),
      );
      await Promise.all(
        functionDumps.map(async (f: any) => {
          const functionRecord = await Function.findOne({
            where: {
              symbolId: symbolRecordsByOffset[f.offset].id,
            },
          });
          const symbolRecord = await Symbol.findOne({
            where: {
              id: symbolRecordsByOffset[f.offset].id,
            },
          });
          symbolRecord!.functionId = functionRecord!.id;
          symbolRecord!.name = f.name ?? symbolRecord!.name;
          await symbolRecord!.save();
        }),
      );
    } finally {
      // Close the r2pipe connection
      r2.quit();
    }
  }
}
