import { Router } from "express";
import { keyBy } from "lodash-es";
import multer from "multer";
import { Op, Transaction } from "sequelize";
import { sequelize } from "../../datasource.ts";
import { analyze_ghidra } from "../../helpers/analyze.js";
import { Binary } from "../models/binary.ts";
import { Invite } from "../models/invite.ts";
import { Project } from "../models/project.ts";
import { Symbol } from "../models/symbol.ts";
import { User } from "../models/user.ts";
import {
  STATUS_CREATED,
  STATUS_INVALID_REQUEST,
  STATUS_NO_CONTENT,
  STATUS_SERVER_ERROR,
  catchErrors,
  paginate,
  sendPaginatePage,
} from "../shared.ts";

const upload = multer({ dest: "uploads/" });

export const projectRouter = Router();

projectRouter.get(
  "/",
  catchErrors(async (req, res) => {
    const userId = req.session.user!.id;

    const myProjects = await Project.findAll({
      attributes: ["id"],
      include: [
        {
          model: User,
          as: "invitees",
          where: { id: userId },
          attributes: [],
          through: { attributes: [] },
        },
      ],
    });

    const { count, rows } = await Project.findAndCountAll({
      attributes: ["id", "name"],
      where: {
        id: {
          [Op.in]: myProjects.map(({ id }) => id),
        },
      },
      include: [
        {
          model: User,
          as: "invitees",
          attributes: ["id", "name", "email"],
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

    const proj = await Project.create({
      name: name,
    });
    await Invite.create({
      userId: req.session.user!.id,
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

    const { symbols, codeUnits } = await analyze_ghidra(file.path);
    if (!symbols || !codeUnits) {
      return res.status(STATUS_SERVER_ERROR).json({ error: "Server error" });
    }

    const symbolsByAddress = keyBy(symbols, ({ address }) => address);
    const foundSymbols = [];
    const disassembly = codeUnits
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

    const binary = await Binary.create({
      name: file.originalname,
      file: file,
      projectId: req.body.projectId,
      disassembly,
    });
    await Symbol.bulkCreate(foundSymbols.map((symbol) => ({ ...symbol, binaryId: binary.id })));

    return res.json(binary);
  }),
);
