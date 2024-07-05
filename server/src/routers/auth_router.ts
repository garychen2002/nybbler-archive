import { Router } from "express";
import { User } from "../models/user.js";
import {
  STATUS_AUTHENTICATION_REQUIRED,
  STATUS_CREATED,
  STATUS_FORBIDDEN,
  STATUS_NO_CONTENT,
  catchErrors,
} from "../shared.js";

export const authRouter = Router();

authRouter.post(
  "/signup",
  catchErrors(async (req, res) => {
    const { email } = req.body;

    const [user, created] = await User.findOrCreate({
      defaults: { email },
      where: { email },
    });
    if (!created) {
      return res.status(STATUS_FORBIDDEN).json({ error: "Username is taken." });
    }

    req.session.user = user;
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
