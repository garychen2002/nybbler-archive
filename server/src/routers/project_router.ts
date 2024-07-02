import { Router } from "express";
import fs from "fs";
import multer from "multer";
import { analyze_ghidra } from "../../helpers/analyze.js";
import { Binary } from "../models/binary.ts";
import { Project } from "../models/project.ts";
import { User } from "../models/user.ts";
import { catchErrors } from "../shared.ts";
const upload = multer({ dest: "uploads/" });

export const projectRouter = Router();

// Get projects given ownerId
projectRouter.get(
  "/",
  catchErrors(async (req, res) => {
    const { ownerId } = req.body;

    const projects = await Project.findAll({
      where: {
        UserId: ownerId,
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(projects);
  }),
);

// Create project with userId as owner
projectRouter.post(
  "/",
  catchErrors(async (req, res) => {
    const { ownerId, name } = req.body;

    const proj = await Project.create({
      name: name,
      UserId: ownerId,
    });
    await proj.reload();

    res.status(200).json({ proj });
  }),
);

projectRouter.delete(
  "/:projectId",
  catchErrors(async (req, res) => {
    const { projectId } = req.params;

    const proj = await Project.findByPk(projectId);

    if (proj) {
      await proj.destroy();
      return res.status(200).json(proj);
    } else {
      return res.status(404).json({ error: "Project not found" });
    }
  }),
);

// Get invitees for project
projectRouter.get(
  "/:projectId/invitees",
  catchErrors(async (req, res) => {
    const { projectId } = req.params;

    const proj = await Project.findOne({
      where: {
        id: projectId,
      },
    });

    if (proj) {
      const invitees = await proj.getUsers();
      res.status(200).json(invitees);
    } else {
      res.status(404).json({ error: "Project not found" });
    }
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
    });

    if (proj) {
      const invitee = await User.findOne({
        where: {
          id: userId,
        },
      });

      if (!invitee) {
        return res.status(404).json({ error: "Invitee not found" });
      }
      await proj.addUser(invitee);
      res.status(200).json(invitee);
    } else {
      res.status(404).json({ error: "Project not found" });
    }
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
    });

    if (proj) {
      const invitee = await User.findOne({
        where: {
          id: userId,
        },
      });

      if (!invitee) {
        return res.status(404).json({ error: "Invitee not found" });
      }
      await proj.removeUser(invitee);
      res.status(200).json(invitee);
    } else {
      res.status(404).json({ error: "Project not found" });
    }
  }),
);

// Add binary
projectRouter.post(
  "/binaries",
  upload.single("binary_file"),
  catchErrors(async (req, res) => {
    if (req.file) {
      const file = req.file;
      console.log("file get");

      await analyze_ghidra(file.path);

      // should create files in /server/outputs (filename.symbols.json)
      // can change to pass in the output as an argument or separate folder
      const symbols_path = file.path + "symbols.json";
      fs.readFile(symbols_path, async (err, content) => {
        if (err || !content) {
          // if created, read in and add the binary to database + related data models
          return res.status(500).json({
            error: "Server error",
          });
        } else {
          try {
            const binary = await Binary.create({
              name: file.originalname,
              file: file,
              symbols: symbols_path,
              ProjectId: req.body.projectId,
            });
            return res.json(binary);
          } catch {
            // can delete?
            return res.status(500).json({
              error: "Server error",
            });
          }
        }
      });
    } else {
      return res.status(422).json({
        error: "Invalid input parameters. Expected file",
      });
    }
  }),
);
