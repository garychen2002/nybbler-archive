import { Router } from "express";
import { Function } from "../models/function.js";
import { catchErrors } from "../shared.js";

export const functionRouter = Router();

functionRouter.get(
  "/:functionId",
  catchErrors(async (req, res) => {
    res.json(await Function.findByPk(Number(req.params.functionId)));
  }),
);
