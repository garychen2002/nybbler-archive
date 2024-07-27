import archiver from "archiver";
import { Router } from "express";
import extract from "extract-zip";
import { mkdtemp, rm } from "fs/promises";
import multer from "multer";
import { tmpdir } from "os";
import { join } from "path";
import { CreationAttributes, Op, Transaction } from "sequelize";
import { sequelize } from "../../datasource.js";
import { analysisQueue } from "../app.js";
import { repo } from "../automerge.js";
import { exportProject, importProject } from "../import_export.js";
import { Binary } from "../models/binary.js";
import { Invite } from "../models/invite.js";
import { Project } from "../models/project.js";
import { Symbol } from "../models/symbol.js";
import { User } from "../models/user.js";
import {
  STATUS_CREATED,
  STATUS_INVALID_REQUEST,
  STATUS_NO_CONTENT,
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
    const user = await getAuthenticatedUser(req);

    await sequelize.transaction(
      { isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE },
      async (transaction) => {
        await Invite.destroy({ transaction, where: { projectId, userId: user!.id } });

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
    const { file } = req;
    if (!file) {
      return res.status(STATUS_INVALID_REQUEST).json({
        error: "Invalid input parameters. Expected file",
      });
    }

    const binary = await Binary.create({
      name: file.originalname,
      file,
      projectId: req.body.projectId,
    } as CreationAttributes<Binary>);

    await analysisQueue.add("Analyze", {
      binaryId: binary.id,
    });

    res.status(STATUS_NO_CONTENT).send();
  }),
);

// Export to zip file
projectRouter.get(
  "/:projectId/exported",
  catchErrors(async (req, res) => {
    const projectId = Number(req.params.projectId);

    const project = await Project.findByPk(projectId, {
      rejectOnEmpty: true,
    });
    const exportDir = await exportProject(project);

    res.contentType("application/zip").attachment(`${project.name}.nybbler.zip`);

    const archive = archiver.create("zip");
    archive.pipe(res);

    archive.directory(exportDir, false);
    archive.on("end", async () => {
      await rm(exportDir, { recursive: true });
    });

    archive.finalize();
  }),
);

// Import from zip file
projectRouter.put(
  "/:projectId/exported",
  upload.single("file"),
  catchErrors(async (req, res) => {
    const { file } = req;
    if (!file) {
      return res.status(STATUS_INVALID_REQUEST).json({
        error: "Invalid input parameters. Expected file",
      });
    }

    const projectId = Number(req.params.projectId);
    const project = await Project.findByPk(projectId, {
      rejectOnEmpty: true,
    });

    const projectDir = await mkdtemp(join(tmpdir(), "nybbler-import-"));
    await extract(file.path, { dir: projectDir });

    try {
      await importProject(projectDir, project);
    } catch (error) {
      console.error("Project import failed:", error);
      return res.status(STATUS_INVALID_REQUEST).json({
        error: "Import failed. Please check your project file for validity.",
      });
    }

    await rm(projectDir, { recursive: true });
    res.status(STATUS_NO_CONTENT).send();
  }),
);
