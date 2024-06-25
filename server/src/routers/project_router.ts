import { Project } from "../models/project.ts";
import { User } from "../models/user.ts";
import { Router } from "express";
import multer from "multer";
const upload = multer({ dest: "uploads/" });
import { analyze_ghidra } from "../../helpers/analyze.js";
import fs from "fs";
import { Binary } from "../models/binary.ts";


export const projectRouter = Router();

// Display invitees
projectRouter.get("/:projectId/invitees", async (req, res) => {
  try {

    res.status(200).json({});
  } catch (error) {
    console.error("Error getting user projects:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add invitee
projectRouter.post("/:projectId/invitees/add", async (req, res) => {
  try {

    res.status(200).json({});
  } catch (error) {
    console.error("Error getting user projects:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Remove invitee
projectRouter.delete("/:projectId/invitees/remove", async (req, res) => {
  try {

    res.status(200).json({});
  } catch (error) {
    console.error("Error getting user projects:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add binary
projectRouter.post("/:projectId/binaries/add",
  upload.single('binary_file'),
  async (req, res) => {
    if (req.file) {
      const file = req.file;
      console.log("file get");
      try {
        const binary = await Binary.create({
          name: req.file.originalname,
          file: req.file,
        });
        await analyze_ghidra(file.path);

        // should create files in /server/outputs (filename.symbols.json)
        fs.readFile(file.path + "symbols.json", async (err, content) =>  {
          if (!err && content) {
        // if created, read in and add the binary to database + related data models
            const data = JSON.parse(content.toString());
            for (const key in data) {
              console.log(`${key}: ${data[key].name}`); // debugging
            }
          }
          else {
            return res.status(500).json({
              error: "Server error",
            });
          }
        })
        return res.json(binary);
      } catch (error) {
        return res.status(500).json({ error: "server error" });
      }

    }
    else {
      return res.status(422).json({
        error: "Invalid input parameters. Expected file",
      });
    }
  });