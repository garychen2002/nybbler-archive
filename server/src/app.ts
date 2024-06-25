import 'dotenv/config'; // env file in server directory

import bodyParser from "body-parser";
import express from "express";
import { sequelize } from "../datasource.ts";
import { Project } from "./models/project.ts";
import { User } from "./models/user.ts";
import { userRouter } from "./routers/user_router.ts";
import { projectRouter } from "./routers/project_router.ts";
import cors from "cors";
import { binaryRouter } from './routers/binary_router.ts';

export const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("static"));
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true
};
app.use(cors(corsOptions));

try {
  await sequelize.authenticate();
  await sequelize.sync({ alter: { drop: false } });
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

app.use((req, res, next) => {
  console.log("HTTP request", req.method, req.url, req.body);
  next();
});

app.use("/api/projects", projectRouter);
app.use("/api/users", userRouter);
app.use("/api/binaries", binaryRouter);


app.listen(PORT, () => {
  console.log(`HTTP server on port ${PORT}`);
});
