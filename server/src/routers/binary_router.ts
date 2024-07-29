import { Router } from "express";
import { catchErrors, getAuthenticatedUser, STATUS_FORBIDDEN } from "../shared.js";
import { Binary } from "../models/binary.js";
import { Project } from "../models/project.js";
import { User } from "../models/user.js";
import { Session } from "../models/session.js";
import { Invite } from "../models/invite.js";
export const binaryRouter = Router();

// Get symbols as json
binaryRouter.get(
  "/:binaryId/symbols",
  catchErrors(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    const binary = await Binary.findByPk(req.params.binaryId);
    if (binary) {
      const projectInvites = await Invite.findOne({where: {
        projectId: binary.projectId,
        userId: user?.id,
      },
    });
      if (!projectInvites)
      {
        res.status(STATUS_FORBIDDEN).send();
      }
    }
    // find the corresponding symbols file and return the json
    res.status(200).json({});
  }),
);
