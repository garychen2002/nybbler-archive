import { Router } from "express";
import { keyBy } from "lodash-es";
import multer from "multer";
import { analyze_ghidra } from "../../helpers/analyze.js";
import { Binary } from "../models/binary.js";
import { Project } from "../models/project.js";
import { Symbol } from "../models/symbol.js";
import { User } from "../models/user.js";
import {
  STATUS_CREATED,
  STATUS_INVALID_REQUEST,
  STATUS_SERVER_ERROR,
  catchErrors,
  paginate,
  sendPaginatePage,
} from "../shared.js";

const upload = multer({ dest: "uploads/" });

export const projectRouter = Router();

projectRouter.get(
  "/",
  catchErrors(async (req, res) => {
    const ownerId = req.session.user!.id;
    const beforeId = Number(req.query.before);
    const afterId = Number(req.query.after);
    const limit = Number(req.query.limit);

    const page = await paginate(
      {
        model: Project,
        primaryKey: "id",
        where: { ownerId },
        include: [
          {
            model: User,
            as: "invitees",
            through: { attributes: [] },
          },
        ],
      },
      beforeId,
      afterId,
      limit,
    );
    sendPaginatePage(res, page);
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

    console.log("   \n\n\n!!!!!!!1    done  !!!!!!!!!!!!!\n\n       ");

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

// Create project with userId as owner
projectRouter.post(
  "/",
  catchErrors(async (req, res) => {
    const { name } = req.body;

    const proj = await Project.create({
      name: name,
      ownerId: req.session.user!.id,
    });

    res.status(STATUS_CREATED).json({ proj });
  }),
);

projectRouter.delete(
  "/:projectId",
  catchErrors(async (req, res) => {
    const { projectId } = req.params;

    const proj = await Project.findByPk(projectId, { rejectOnEmpty: true });

    await proj.destroy();
    return res.json(proj);
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

    await proj.$add("invitees", invitee);
    res.json(invitee);
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
