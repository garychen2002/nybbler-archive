import { Router } from "express";
import { User } from "../models/user.ts";
import {
  STATUS_AUTHENTICATION_REQUIRED,
  STATUS_CREATED,
  STATUS_NO_CONTENT,
  catchErrors,
} from "../shared.js";

export const authRouter = Router();

// Temporary user creation
// TODO: delete this
authRouter.post(
  "/signup",
  catchErrors(async (req, res) => {
    const { name, email } = req.body;

    const [user] = await User.findOrCreate({
      where: {
        email,
      },
      defaults: {
        name,
        email,
      },
    });

    res.status(STATUS_CREATED).json(user);
  }),
);

authRouter.post(
  "/signin",
  catchErrors(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({
      where: { email },
    });
    if (!user) {
      return res.status(STATUS_AUTHENTICATION_REQUIRED).json({ error: "Incorrect username." });
    }

    req.session.user = user;
    res.json(user);
  }),
);

authRouter.post(
  "/signout",
  catchErrors(async (req, res) => {
    delete req.session.user;
    res.status(STATUS_NO_CONTENT).send();
  }),
);
