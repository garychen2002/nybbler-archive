import { Router } from "express";
import { catchErrors } from "../shared.js";

export const binaryRouter = Router();

// Get symbols as json
binaryRouter.get(
  "/:binaryId/symbols",
  catchErrors(async (req, res) => {
    // find the corresponding symbols file and return the json
    res.status(200).json({});
  }),
);
