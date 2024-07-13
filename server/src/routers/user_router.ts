import { Router } from "express";
import { User } from "../models/user.js";
import { catchErrors } from "../shared.js";

export const userRouter = Router();

userRouter.get(
  "/",
  catchErrors(async (req, res) => {
    // TODO: paginate

    const { count, rows } = await User.findAndCountAll({
      attributes: ["id", "name", "email"],
      order: [["id", "DESC"]],
    });

    res.json({ count, items: rows });
  }),
);

userRouter.get(
  "/me",
  catchErrors(async (req, res) => {
    res.json(req.session.user);
  }),
);
