import "dotenv/config"; // env file in server directory

import bodyParser from "body-parser";
import { Queue } from "bullmq";
import cors from "cors";
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { sequelize } from "../datasource.js";
import { runAnalysisResponseService } from "./analysis_response.js";
import { runAutomergeService } from "./automerge.js";
import { initModels } from "./models/_init.js";
import { authRouter } from "./routers/auth_router.js";
import { binaryRouter } from "./routers/binary_router.js";
import { functionRouter } from "./routers/function_router.js";
import { projectRouter } from "./routers/project_router.js";
import { userRouter } from "./routers/user_router.js";
import { RedisConnectionOptions, requireAuthenticated } from "./shared.js";

const PORT = process.env.PORT ?? 3000;

export const app = express();
const httpServer = http.createServer(app);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("static"));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true,
    exposedHeaders: ["Content-Disposition"],
  }),
);

export const analysisQueue = new Queue("Analysis", {
  connection: RedisConnectionOptions,
});

(async () => {
  try {
    await sequelize.authenticate();
    initModels();
    await sequelize.sync({ alter: { drop: false } });
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }

  app.use((req, res, next) => {
    console.log("HTTP request", req.method, req.url, req.body);
    next();
  });

  app.use("/auth", authRouter);
  app.use("/api/projects", requireAuthenticated, projectRouter);
  app.use("/api/users", requireAuthenticated, userRouter);
  app.use("/api/binaries", requireAuthenticated, binaryRouter);
  app.use("/api/functions", requireAuthenticated, functionRouter);

  // https://automerge.org/docs/repositories/networking/#usage-with-express
  // https://stackoverflow.com/questions/28666527/how-to-handle-http-upgrade-in-expressjs
  const wss = new WebSocketServer({ noServer: true });
  httpServer.on(
    "upgrade",
    // @ts-ignore
    (request, socket, head) => {
      console.log("Upgrade to websocket");
      wss.handleUpgrade(request, socket, head, (socket) => {
        wss.emit("connection", socket, request);
      });
    },
  );
  runAutomergeService(wss);

  runAnalysisResponseService();

  httpServer.listen(PORT, () => {
    console.log(`HTTP server on port ${PORT}`);
  });
})();
