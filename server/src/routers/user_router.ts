import { Router } from "express";
import { User } from "../models/user.ts";
import { catchErrors } from "../shared.ts";

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
