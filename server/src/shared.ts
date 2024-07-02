import { Request, Response } from "express";
import {
  EmptyResultError,
  ForeignKeyConstraintError,
  UniqueConstraintError,
  ValidationError,
} from "sequelize";

export const STATUS_CREATED = 201;
export const STATUS_NO_CONTENT = 204;
export const STATUS_AUTHENTICATION_REQUIRED = 401;
export const STATUS_FORBIDDEN = 403;
export const STATUS_NOT_FOUND = 404;
export const STATUS_INVALID_REQUEST = 422;
export const STATUS_SERVER_ERROR = 500;

export const catchErrors =
  (body: (req: Request, res: Response) => Promise<any>) => async (req: Request, res: Response) => {
    try {
      return await body(req, res);
    } catch (error: any) {
      switch (error.constructor) {
        case ForeignKeyConstraintError:
        case EmptyResultError:
          return res.status(STATUS_NOT_FOUND).json({ error: "Named entity does not exist." });
        case ValidationError:
        case UniqueConstraintError:
          return res
            .status(STATUS_INVALID_REQUEST)
            .json({ error: `Invalid input parameters. (${error.message})` });
        default:
          // When a server error happens, we *want* to log it.
          // (Server errors should never happen!)
          console.error(error);
          return res.status(STATUS_SERVER_ERROR).json({ error: "Server error!" });
      }
    }
  };
