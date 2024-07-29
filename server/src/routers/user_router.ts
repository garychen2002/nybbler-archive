import axios from "axios";
import { Router } from "express";
import { getRepos } from "../github_api.js";
import { User } from "../models/user.js";
import { catchErrors, getAuthenticatedUser, getGithubAccessToken } from "../shared.js";

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
    const token = await getGithubAccessToken(req);
    if (!token) return null;
    const response = await getRepos(token);
    const repos = response.data;

    res.json(repos);
  }),
);

userRouter.get(
  "/branches",
  catchErrors(async (req, res) => {
    const { owner, repo } = req.query;
    const token = await getGithubAccessToken(req);
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/branches`, {
      headers: { Authorization: `token ${token}` },
    });

    res.json(response.data);
  }),
);
