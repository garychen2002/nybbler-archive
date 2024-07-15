import { Router } from "express";
import { keyBy } from "lodash-es";
import multer from "multer";
import { R2Pipe } from "r2pipe-promise";
import { Op, Transaction } from "sequelize";
import { sequelize } from "../../datasource.js";
import { analyze_ghidra } from "../../helpers/analyze.js";
import { repo } from "../automerge.js";
import { Binary } from "../models/binary.js";
import { Function } from "../models/function.js";
import { Invite } from "../models/invite.js";
import { Project } from "../models/project.js";
import { Symbol } from "../models/symbol.js";
import { User } from "../models/user.js";
import {
  STATUS_CREATED,
  STATUS_INVALID_REQUEST,
  STATUS_NO_CONTENT,
  STATUS_SERVER_ERROR,
  catchErrors,
  getAuthenticatedUser,
  paginate,
  sendPaginatePage,
} from "../shared.js";

const upload = multer({ dest: "uploads/" });

export const projectRouter = Router();

projectRouter.get(
  "/",
  catchErrors(async (req, res) => {
    const user = await getAuthenticatedUser(req);

    const myProjects = await Project.findAll({
      attributes: ["id"],
      include: [
        {
          model: User,
          as: "invitees",
          where: { id: user!.id },
          attributes: [],
          through: { attributes: [] },
        },
      ],
    });

    const { count, rows } = await Project.findAndCountAll({
      attributes: ["id", "name", "automergeDocumentId"],
      where: {
        id: {
          [Op.in]: myProjects.map(({ id }) => id),
        },
      },
      include: [
        {
          model: User,
          as: "invitees",
          attributes: ["id", "username", "name"],
          through: { attributes: [] },
        },
      ],
      order: [["id", "DESC"]],
    });

    res.json({ count, items: rows });
  }),
);

projectRouter.get(
  "/:projectId",
  catchErrors(async (req, res) => {
    const projectId = Number(req.params.projectId);

    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: User,
          as: "invitees",
          through: { attributes: [] },
        },
        {
          model: Binary,
          include: [Symbol],
        },
      ],
      rejectOnEmpty: true,
    });

    res.json(project);
  }),
);

projectRouter.patch(
  "/:projectId",
  catchErrors(async (req, res) => {
    const projectId = Number(req.params.projectId);

    const project = await Project.findByPk(projectId, { rejectOnEmpty: true });
    project.update(req.body, { fields: ["name"] });

    res.json(project);
  }),
);

projectRouter.post(
  "/",
  catchErrors(async (req, res) => {
    const { name } = req.body;
    const user = await getAuthenticatedUser(req);

    const docHandle = repo.create({});

    const proj = await Project.create({
      name: name,
      automergeDocumentId: docHandle.documentId,
    });
    await Invite.create({
      userId: user!.id,
      projectId: proj.id!,
    });

    res.status(STATUS_CREATED).json({ proj });
  }),
);

projectRouter.delete(
  "/:projectId",
  catchErrors(async (req, res) => {
    const { projectId } = req.params;

    await sequelize.transaction(
      { isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE },
      async (transaction) => {
        await Invite.destroy({ transaction, where: { projectId, userId: req.session.user!.id } });

        const invitesLeft = await Invite.count({ transaction, where: { projectId } });
        if (!invitesLeft) {
          const proj = await Project.findByPk(projectId, { transaction, rejectOnEmpty: true });
          await proj.destroy({ transaction });
        }
      },
    );

    return res.status(STATUS_NO_CONTENT).send();
  }),
);

// Get invitees for project
projectRouter.get(
  "/:projectId/invitees",
  catchErrors(async (req, res) => {
    const projectId = Number(req.params.projectId);
    const beforeId = Number(req.query.before);
    const afterId = Number(req.query.after);
    const limit = Number(req.query.limit);

    // https://sequelize.org/docs/v6/advanced-association-concepts/eager-loading/#complex-where-clauses-at-the-top-level
    const page = await paginate(
      {
        model: User,
        primaryKey: "id",
        include: {
          model: Project,
          as: "invitedProjects",
          attributes: ["id"],
          through: { attributes: [] },
        },
        where: { "$invitedProjects.id$": projectId },
      },
      beforeId,
      afterId,
      limit,
    );
    sendPaginatePage(res, page);
  }),
);

// Add invitee
projectRouter.post(
  "/:projectId/invitees",
  catchErrors(async (req, res) => {
    const { projectId } = req.params;
    const { userIds } = req.body;

    const proj = await Project.findOne({
      where: {
        id: projectId,
      },
      rejectOnEmpty: true,
    });

    const invitees = await User.findAll({
      where: {
        id: { [Op.in]: userIds },
      },
    });

    await Promise.all(invitees.map((invitee) => proj.$add("invitees", invitee)));

    res.status(STATUS_CREATED).send();
  }),
);

// Remove invitee
projectRouter.delete(
  "/:projectId/invitees",
  catchErrors(async (req, res) => {
    const { projectId } = req.params;
    const { userId } = req.body;

    const proj = await Project.findOne({
      where: {
        id: projectId,
      },
      rejectOnEmpty: true,
    });

    const invitee = await User.findOne({
      where: {
        id: userId,
      },
      rejectOnEmpty: true,
    });

    await proj.$remove("invitees", invitee);
    res.json(invitee);
  }),
);

// Add binary
projectRouter.post(
  "/binaries",
  upload.single("binary_file"),
  catchErrors(async (req, res) => {
    if (!req.file) {
      return res.status(STATUS_INVALID_REQUEST).json({
        error: "Invalid input parameters. Expected file",
      });
    }

    const file = req.file;

    const binary = await Binary.create({
      name: file.originalname,
      file: file,
      projectId: req.body.projectId,
    });

    const { symbols, codeUnits, instructions } = await analyze_ghidra(file.path);
    if (!symbols || !instructions) {
      return res.status(STATUS_SERVER_ERROR).json({ error: "Server error" });
    }

    const symbolsByAddress = keyBy(symbols, ({ address }) => address);
    const foundSymbols: Partial<Symbol>[] = [];
    const disassembly = instructions
      .map(({ address, instruction }) => {
        let label = "";
        if (address in symbolsByAddress) {
          const symbol = symbolsByAddress[address];
          label = `${symbol.name}:\n`;
          foundSymbols.push(symbol);
        }

        return `${label}\t${address}\t${instruction}`;
      })
      .join("\n");

    await Symbol.bulkCreate(foundSymbols.map((symbol) => ({ ...symbol, binaryId: binary.id })));
    const symbolRecords = await (binary as any).getSymbols();
    const symbolRecordsByOffset = keyBy(symbolRecords, ({ address }) =>
      Number.parseInt(address, 16),
    );

    // Written with GPT help
    {
      // Open the binary file in Radare2
      //
      // NOTE(ian): This returns a promise so the await IS NECESSARY.
      //            r2pipe's type definitions are wrong.
      const r2 = await R2Pipe.open(file.path);

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

    await binary.reload();
    return res.json(binary);
  }),
);
