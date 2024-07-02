import { Project } from "../models/project.ts";
import { User } from "../models/user.ts";
import { Router } from "express";
import multer from "multer";
const upload = multer({ dest: "uploads/" });
import { analyze_ghidra } from "../../helpers/analyze.js";
import fs from "fs";
import { Binary } from "../models/binary.ts";

export const binaryRouter = Router();
// Get symbols as json
binaryRouter.get("/:binaryId/symbols", async (req, res) => {
  try {
    // find the corresponding symbols file and return the json
    res.status(200).json({});
  } catch (error) {
    console.error("Error getting user projects:", error);
    res.status(500).json({ error: "Server error" });
  }
});
