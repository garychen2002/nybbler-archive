import axios from "axios";
import { Router } from "express";
import { Session } from "../models/session.js";
import { User } from "../models/user.js";
import {
  STATUS_AUTHENTICATION_REQUIRED,
  STATUS_NO_CONTENT,
  catchErrors,
  getAuthenticatedUser,
} from "../shared.js";

export const authRouter = Router();

authRouter.get("/signup", (req, res) => {
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}`);
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
        redirect_uri: process.env.REDIRECT_URI
      },
      headers: {
        accept: "application/json",
      },
    });

    const access = response.data.access_token;
    if (!access) {
      return res
        .status(STATUS_AUTHENTICATION_REQUIRED)
        .json({ error: "Invalid authorization code." });
    }

    const githubUser = await axios
      .get("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${access}`,
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

    const { token } = await Session.create({
      userId: user.id!,
    });
    res.json({ token, access});
  }),
);

authRouter.post(
  "/signout",
  catchErrors(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) return;

    await Session.destroy({ where: { userId: user.id } });

    res.status(STATUS_NO_CONTENT).send();
  }),
);
