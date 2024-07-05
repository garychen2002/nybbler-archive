import { Router } from "express";
import { User } from "../models/user.js";
import { catchErrors } from "../shared.js";

export const userRouter = Router();

// Temporary user creation
userRouter.post(
  "/",
  catchErrors(async (req, res) => {
    const { name, email } = req.body;

    const user = await User.create({
      name: name,
      email: email,
    });
    await user.reload();

    res.status(200).json({ user });
  }),
);
