import { Project } from "../models/project.ts";
import { User } from "../models/user.ts";
import { Router } from "express";

export const userRouter = Router();

// Temporary user creation
userRouter.post("/signup", async (req, res) => {
  try {
    let user = await User.create({
      name: req.body.name,
    });
    await user.reload();

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create user project for owner userId
userRouter.post("/:userId/create", async (req, res) => {
  const { userId } = req.params;
  try {
    let proj = await Project.create({
      name: req.body.name,
      UserId: userId
    });
    await proj.reload();

    res.status(200).json({ proj });
  } catch (error) {
    console.error("Error getting user projects:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get userId projects
userRouter.get("/:userId/projects", async (req, res) => {
  const { userId } = req.params;
  try {
    const projects = await Project.findAll({
      where: {
        UserId: userId,
      },
      order: [["createdAt", "DESC"]],
    });
    
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error getting user projects:", error);
    res.status(500).json({ error: "Server error" });
  }
});