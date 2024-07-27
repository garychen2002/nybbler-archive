import { mkdir, mkdtemp, readdir, readFile, writeFile } from "fs/promises";
import { chain, cloneDeep, pick } from "lodash-es";
import { tmpdir } from "os";
import { join } from "path";
import { CreationAttributes, Transaction } from "sequelize";
import { sequelize } from "../datasource.js";
import { repo } from "./automerge.js";
import { CollabProject } from "./models/_collab.js";
import { Binary } from "./models/binary.js";
import { Function } from "./models/function.js";
import { Project } from "./models/project.js";
import { Symbol } from "./models/symbol.js";

export type ExportedProject = {
  name: string;
  collab?: CollabProject;
};

export type ExportedBinary = {
  name: string;
  symbols: ExportedSymbol[];
};

export type ExportedSymbol = {
  name: string;
  address: string;
  functionId?: number;
};

export type ExportedFunction = {
  disassembly: string;
};

class IdentifierMap {
  private map = new Map<number, number>();
  private next = 1;

  generate(id: number): number {
    if (!this.map.has(id)) this.map.set(id, this.next++);
    return this.map.get(id)!;
  }
}

/**
 * Exports `project` to a temporary directory, and returns a path to that directory.
 */
export async function exportProject(projectRecord: Project): Promise<string> {
  const projectDir = await mkdtemp(join(tmpdir(), "nybbler-export-"));

  const binaryIDs = new IdentifierMap();
  const functionIDs = new IdentifierMap();

  const binariesDir = join(projectDir, "binaries");
  await mkdir(binariesDir);

  const binaryRecords: Binary[] = await projectRecord.$get("binaries", { order: ["name"] });
  await Promise.all(
    binaryRecords.map(async (binaryRecord) => {
      const binaryDir = join(binariesDir, binaryIDs.generate(binaryRecord.id!).toString());
      await mkdir(binaryDir);

      const symbolRecords: Symbol[] = await binaryRecord.$get("symbols", { order: ["address"] });
      const symbols: ExportedSymbol[] = symbolRecords.map((symbolRecord) => ({
        name: symbolRecord.name,
        address: symbolRecord.address,
        functionId: functionIDs.generate(symbolRecord.functionId),
      }));

      const binary: ExportedBinary = {
        name: binaryRecord.name,
        symbols,
      };
      await writeFile(join(binaryDir, "binary.nybbler.json"), JSON.stringify(binary));

      const functionsDir = join(binaryDir, "functions");
      await mkdir(functionsDir);

      await Promise.all(
        symbolRecords.map(async (symbolRecord) => {
          const functionRecord: Function | null = await symbolRecord.$get("function");
          if (!functionRecord) return;

          const functionDir = join(
            functionsDir,
            functionIDs.generate(functionRecord.id!).toString(),
          );
          await mkdir(functionDir);

          const function_: ExportedFunction = pick(functionRecord, ["disassembly"]);
          await writeFile(join(functionDir, "function.nybbler.json"), JSON.stringify(function_));
        }),
      );
    }),
  );

  const docHandle = repo.find<CollabProject>(projectRecord.automergeDocumentId);
  const doc: CollabProject = cloneDeep((await docHandle.doc()) ?? {});

  const collab: CollabProject = {
    ...doc,
    binaries: chain(doc.binaries ?? {})
      // Discard binaries currently being analyzed
      .pickBy((binary) => !!binary.analysisStatus)
      // Remap IDs
      .mapKeys((_, binaryID) => binaryIDs.generate(Number(binaryID)))
      .value(),
  };

  const project: ExportedProject = {
    name: projectRecord.name,
    collab,
  };
  await writeFile(join(projectDir, "project.nybbler.json"), JSON.stringify(project));

  return projectDir;
}

async function readJSON(file: string) {
  return JSON.parse((await readFile(file)).toString());
}

/**
 * Imports a previously exported project from `projectDir`, dumping the contents into
 * the existing project `replaceProjectRecord`.
 *
 * The following are retained from the existing project:
 * - project ID
 * - project name
 * - invited users
 * - automerge document ID
 */
export async function importProject(projectDir: string, replaceProjectRecord: Project) {
  await sequelize.transaction(
    { isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE },
    async () => {
      const binaryRecordIDs = new Map<string, number>();
      const functionRecordIDs = new Map<string, number>();

      await Promise.all(
        (await replaceProjectRecord.$get("binaries")).map((binaryRecord) => binaryRecord.destroy()),
      );

      const binariesDir = join(projectDir, "binaries");
      const binaryIDs = await readdir(binariesDir);
      await Promise.all(
        binaryIDs.map(async (binaryID) => {
          const binaryDir = join(binariesDir, binaryID);

          const binary: ExportedBinary = await readJSON(join(binaryDir, "binary.nybbler.json"));
          const binaryRecord = await Binary.create({
            name: binary.name,
            projectId: replaceProjectRecord.id!,
          } as CreationAttributes<Binary>);
          binaryRecordIDs.set(binaryID, binaryRecord.id!);

          const functionsDir = join(binaryDir, "functions");
          const functionIDs = await readdir(functionsDir);
          await Promise.all(
            functionIDs.map(async (functionID) => {
              const functionDir = join(functionsDir, functionID);

              const function_: ExportedFunction = await readJSON(
                join(functionDir, "function.nybbler.json"),
              );
              const functionRecord = await Function.create({
                disassembly: function_.disassembly,
              } as CreationAttributes<Function>);
              functionRecordIDs.set(functionID, functionRecord.id!);
            }),
          );

          await Promise.all(
            binary.symbols.map(async (symbol) => {
              await Symbol.create({
                name: symbol.name,
                address: symbol.address,
                binaryId: binaryRecordIDs.get(binaryID),
                functionId: symbol.functionId
                  ? functionRecordIDs.get(symbol.functionId.toString())
                  : undefined,
              } as CreationAttributes<Symbol>);
            }),
          );
        }),
      );

      const { collab }: ExportedProject = await readJSON(join(projectDir, "project.nybbler.json"));

      const docHandle = repo.find<CollabProject>(replaceProjectRecord.automergeDocumentId);
      await docHandle.whenReady();
      docHandle.change((doc) => {
        const importedCollabBinaries = collab?.binaries ?? {};
        doc.binaries ??= {};

        for (const binaryID in importedCollabBinaries) {
          const value = importedCollabBinaries[Number(binaryID)];
          delete doc.binaries[Number(binaryID)];

          const newID = binaryRecordIDs.get(binaryID);
          if (newID) doc.binaries[newID] = value;
        }
      });
    },
  );
}
