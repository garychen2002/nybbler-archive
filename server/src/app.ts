import "dotenv/config"; // env file in server directory

import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import session from "express-session";
import { sequelize } from "../datasource.ts";
import { initModels } from "./models/_init.ts";
import { User } from "./models/user.ts";
import { authRouter } from "./routers/auth_router.ts";
import { binaryRouter } from "./routers/binary_router.ts";
import { projectRouter } from "./routers/project_router.ts";
import { userRouter } from "./routers/user_router.ts";
import { requireAuthenticated as requireAuthentication } from "./shared.ts";

export const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(
  session({
    secret: process.env.SESSION_SECRET ?? "this is a bad secret, please set one in the environment",
    resave: false,
    saveUninitialized: true,
  }),
);
declare module "express-session" {
  interface SessionData {
    user: User;
  }
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("static"));
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));

try {
  await sequelize.authenticate();
  initModels();
  await sequelize.sync({ alter: { drop: false } });
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

app.use((req, res, next) => {
  console.log("HTTP request", req.method, req.url, req.body);
  next();
});

app.use("/auth", authRouter);
app.use("/api/projects", requireAuthentication, projectRouter);
app.use("/api/users", requireAuthentication, userRouter);
app.use("/api/binaries", requireAuthentication, binaryRouter);

app.listen(PORT, () => {
  console.log(`HTTP server on port ${PORT}`);
});
