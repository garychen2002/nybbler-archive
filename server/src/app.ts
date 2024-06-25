import bodyParser from "body-parser";
import express from "express";
import { sequelize } from "../datasource.ts";
import { Project } from "./models/project.ts";
import { User } from "./models/user.ts";
import { userRouter } from "./routers/user_router.ts";
import { projectRouter } from "./routers/project_router.ts";

export const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("static"));

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

app.listen(PORT, () => {
  console.log(`HTTP server on port ${PORT}`);
});
