import axios from "axios";
import { Router } from "express";
import { User } from "../models/user.js";
import {
  STATUS_AUTHENTICATION_REQUIRED,
  STATUS_CREATED,
  STATUS_NO_CONTENT,
  catchErrors,
} from "../shared.js";

export const authRouter = Router();

authRouter.get("/signup", (req, res) => {
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}`);
});

authRouter.get("/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const response = await axios.post('https://github.com/login/oauth/access_token', null, {
      params: {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code
      },
      headers: {
        accept: 'application/json',
      },
    });

    const accessToken = response.data.access_token;

    const githubUser = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((res) => res.data);

    let user = await User.findOne({ where: { email: githubUser.email } });
    if (!user) {
      user = await User.create({
        name: githubUser.login,
        email: githubUser.email
      });
    }

    req.session.user = user;
    console.log(req.session);
    res.status(STATUS_CREATED).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get access token' });
  }
});

/*
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
*/

authRouter.post(
  "/signout",
  catchErrors(async (req, res) => {
    delete req.session.user;
    res.status(STATUS_NO_CONTENT).send();
  }),
);
