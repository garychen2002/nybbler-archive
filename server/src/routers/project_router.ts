import { Project } from "../models/project.ts";
import { User } from "../models/user.ts";
import { Router } from "express";

export const projectRouter = Router();

// Display invitees
projectRouter.get("/:projectId/invitees", async (req, res) => {
  const { projectId } = req.params;
  try {
    let proj = await Project.findOne({
      where: {
        id: projectId
      }
    })

    if (proj) {
      res.status(200).json(JSON.parse(proj.invitedIds));
    } else {
      res.status(404).json({ error: "Project not found" });
    }
  } catch (error) {
    console.error("Error getting user projects:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add invitee
projectRouter.post("/:projectId/invitees", async (req, res) => {
  const { projectId } = req.params;
  const { inviteeId } = req.body;
  try {
    let proj = await Project.findOne({
      where: {
        id: projectId
      }
    })

    if (proj) {
      let invitedIds = JSON.parse(proj.invitedIds);
      if (!invitedIds.includes(inviteeId)) {
        invitedIds.push(inviteeId);
        proj.invitedIds = JSON.stringify(invitedIds);

        await proj.save();
      }

      res.status(200).json(invitedIds);
    } else {
      res.status(404).json({ error: "Project not found" });
    }
  } catch (error) {
    console.error("Error getting user projects:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Remove invitee
projectRouter.delete("/:projectId/invitees", async (req, res) => {
  const { projectId } = req.params;
  const { inviteeId } = req.body;
  try {
    let proj = await Project.findOne({
      where: {
        id: projectId
      }
    })

    if (proj) {
      let invitedIds = JSON.parse(proj.invitedIds);
      const index = invitedIds.indexOf(inviteeId);
      console.log(index);
      if (index > -1) {
        invitedIds.splice(index, 1);
        proj.invitedIds = JSON.stringify(invitedIds);

        await proj.save();
      }

      res.status(200).json(invitedIds);
    } else {
      res.status(404).json({ error: "Project not found" });
    }
  } catch (error) {
    console.error("Error getting user projects:", error);
    res.status(500).json({ error: "Server error" });
  }
});