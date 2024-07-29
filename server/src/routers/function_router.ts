import { Router } from "express";
import { Function } from "../models/function.js";
import { catchErrors, getAuthenticatedUser, STATUS_FORBIDDEN } from "../shared.js";
import { Invite } from "../models/invite.js";

export const functionRouter = Router();

functionRouter.get(
  "/:functionId",
  catchErrors(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    const funct = await Function.findOne({
      where: {
        id: req.params.functionId,
      },
    });
    if (funct?.symbol?.binary?.project) {
      const projectInvites = await Invite.findOne({
        where: {
          projectId: funct?.symbol?.binary?.projectId,
          userId: user?.id,
        },
      });
      if (!projectInvites) {
        res.status(STATUS_FORBIDDEN).send();
      }
    }
    res.json(await Function.findByPk(Number(req.params.functionId)));
  }),
);
