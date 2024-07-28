import { Router } from "express";
import { User } from "../models/user.js";
import { catchErrors, getAuthenticatedUser, getBearerToken } from "../shared.js";
import axios from "axios";

export const userRouter = Router();

userRouter.get(
  "/",
  catchErrors(async (req, res) => {
    // TODO: paginate

    const { count, rows } = await User.findAndCountAll({
      attributes: ["id", "username", "name"],
      order: [["id", "DESC"]],
    });

    res.json({ count, items: rows });
  }),
);

userRouter.get(
  "/me",
  catchErrors(async (req, res) => {
    res.json((await getAuthenticatedUser(req))!);
  }),
);

userRouter.get(
  "/repos",
  catchErrors(async (req, res) => {
    const token = getBearerToken(req);
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: { Authorization: `Bearer ${token}` }
    });

    res.json(response.data);
  }),
);

userRouter.get(
  "/branches",
  catchErrors(async (req, res) => {
    const {owner, repo} = req.params;
    const token = getBearerToken(req);
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/branches`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    res.json(response.data);
  }),
)
