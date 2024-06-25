import { Project } from "../models/project.ts";
import { User } from "../models/user.ts";
import { Router } from "express";

export const userRouter = Router();

// Temporary user creation
userRouter.post("/", async (req, res) => {
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