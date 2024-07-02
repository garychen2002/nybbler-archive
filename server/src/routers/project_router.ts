import { Router } from "express";
import fs from "fs";
import multer from "multer";
import { analyze_ghidra } from "../../helpers/analyze.js";
import { Binary } from "../models/binary.ts";
import { Project } from "../models/project.ts";
import { User } from "../models/user.ts";
import {
  STATUS_CREATED,
  STATUS_INVALID_REQUEST,
  STATUS_SERVER_ERROR,
  catchErrors,
  paginate,
  sendPaginatePage,
} from "../shared.ts";

const upload = multer({ dest: "uploads/" });

export const projectRouter = Router();

// Get projects given ownerId
projectRouter.get(
  "/",
  catchErrors(async (req, res) => {
    const ownerId = Number(req.query.ownerId);
    const beforeId = Number(req.query.before);
    const afterId = Number(req.query.after);
    const limit = Number(req.query.limit);

    const page = await paginate(
      { model: Project, primaryKey: "id", where: { ownerId } },
      beforeId,
      afterId,
      limit,
    );
    sendPaginatePage(res, page);
  }),
);

// Create project with userId as owner
projectRouter.post(
  "/",
  catchErrors(async (req, res) => {
    const { ownerId, name } = req.body;

    const proj = await Project.create({
      name: name,
      ownerId: ownerId,
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

    await analyze_ghidra(file.path);

    // should create files in /server/outputs (filename.symbols.json)
    // can change to pass in the output as an argument or separate folder
    const symbols_path = file.path + "symbols.json";
    fs.readFile(symbols_path, async (err, content) => {
      if (err || !content) {
        // if created, read in and add the binary to database + related data models
        return res.status(STATUS_SERVER_ERROR).json({
          error: "Server error",
        });
      } else {
        try {
          const binary = await Binary.create({
            name: file.originalname,
            file: file,
            symbols: symbols_path,
            projectId: req.body.projectId,
          });
          return res.json(binary);
        } finally {
          // can delete?
          return res.status(STATUS_SERVER_ERROR).json({
            error: "Server error",
          });
        }
      }
    });
  }),
);
