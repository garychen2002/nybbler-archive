import axios from "axios";
import { Router } from "express";
import { User } from "../models/user.js";
import { STATUS_AUTHENTICATION_REQUIRED, STATUS_NO_CONTENT, catchErrors } from "../shared.js";

export const authRouter = Router();

authRouter.get("/signup", (req, res) => {
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}`);
});

authRouter.get(
  "/callback",
  catchErrors(async (req, res) => {
    const { code } = req.query;

    const response = await axios.post("https://github.com/login/oauth/access_token", null, {
      params: {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code,
      },
      headers: {
        accept: "application/json",
      },
    });

    const accessToken = response.data.access_token;
    if (!accessToken) {
      return res
        .status(STATUS_AUTHENTICATION_REQUIRED)
        .json({ error: "Invalid authorization code." });
    }

    const githubUser = await axios
      .get("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => res.data);

    const [user] = await User.findOrCreate({
      where: {
        username: githubUser.login,
      },
      defaults: {
        username: githubUser.login,
        name: githubUser.name,
      },
    });

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
