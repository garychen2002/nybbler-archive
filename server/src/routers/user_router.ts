import { Project } from "../models/project.ts";
import { User } from "../models/user.ts";
import { Router } from "express";

export const userRouter = Router();

// Temporary user creation
userRouter.post("/", async (req, res) => {
  const { name, email } = req.body
  try {
    let user = await User.create({
      name: name,
      email: email
    });
    await user.reload();

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ error: "Server error" });
  }
});