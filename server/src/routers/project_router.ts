import { Project } from "../models/project.ts";
import { User } from "../models/user.ts";
import { Router } from "express";

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