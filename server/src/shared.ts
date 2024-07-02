import { Request, Response } from "express";
import { pick } from "lodash-es";
import {
  Attributes,
  EmptyResultError,
  FindOptions,
  ForeignKeyConstraintError,
  Model,
  ModelStatic,
  Op,
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

/** Name of an attribute defined on `ModelT`. */
type ModelAttributeKey<ModelT extends Model> = keyof Attributes<ModelT> & string;

export type PaginateOptions<ModelT extends Model, PrimaryKey extends ModelAttributeKey<ModelT>> = {
  model: ModelStatic<ModelT>;
  primaryKey: PrimaryKey;
} & Pick<FindOptions<ModelT>, "attributes" | "include" | "where">;

export type PaginatePage<ModelT extends Model, PrimaryKey extends ModelAttributeKey<ModelT>> = {
  total: number;
  items: ModelT[];
  older: Pick<ModelT, PrimaryKey> | null;
  newer: Pick<ModelT, PrimaryKey> | null;
};

export async function paginate<ModelT extends Model, PrimaryKey extends ModelAttributeKey<ModelT>>(
  { model, primaryKey, attributes, include, where }: PaginateOptions<ModelT, PrimaryKey>,
  beforeID: ModelT[PrimaryKey],
  afterID: ModelT[PrimaryKey],
  limit: number,
): Promise<PaginatePage<ModelT, PrimaryKey> | { status: number; error: string }> {
  if (!(limit >= 1 && limit <= 100)) {
    return { status: 422, error: "Invalid limit." };
  }

  const isAfterQuery = afterID && !beforeID;

  let [total, items] = await Promise.all([
    // Total
    model.count({ include, where }),
    // Items
    model.findAll({
      attributes,
      include,
      where: {
        ...where,
        [primaryKey]: {
          ...(beforeID ? { [Op.lte]: beforeID } : {}),
          [Op.gte]: afterID || 1,
        },
      },
      subQuery: false,
      limit,
      // If this is a pure "after=" query, return oldest matching items.
      // In every other case (pure "before=", both "after=" and "before=", or neither),
      // return newest matching items.
      order: [[primaryKey, isAfterQuery ? "ASC" : "DESC"]],
    }),
  ]);
  items = items.sort((a, b) => Number(b[primaryKey]) - Number(a[primaryKey]));

  let older, newer;
  if (items.length === 0) {
    if (isAfterQuery) {
      older = await model.findOne({
        attributes: [primaryKey],
        include,
        where,
        subQuery: false,
        order: [[primaryKey, "DESC"]],
      });
      newer = null;
    } else {
      older = null;
      newer = await model.findOne({
        attributes: [primaryKey],
        include,
        where,
        subQuery: false,
        order: [[primaryKey, "ASC"]],
      });
    }
  } else {
    const oldestSelected = items[items.length - 1][primaryKey];
    const newestSelected = items[0][primaryKey];

    [older, newer] = await Promise.all([
      // Older
      model.findOne({
        attributes: [primaryKey],
        include,
        where: { ...where, [primaryKey]: { [Op.lt]: oldestSelected } },
        subQuery: false,
        order: [[primaryKey, "DESC"]],
      }),

      // Newer
      model.findOne({
        attributes: [primaryKey],
        include,
        where: {
          ...where,
          [primaryKey]: { [Op.gt]: newestSelected },
        },
        subQuery: false,
        order: [[primaryKey, "ASC"]],
      }),
    ]);

    // Remove included associations, if any (which may have been used in the `where` clause)
    if (older) older = pick(older, primaryKey);
    if (newer) newer = pick(newer, primaryKey);
  }

  return {
    total,
    items,
    older,
    newer,
  };
}

export function sendPaginatePage(
  res: Response,
  paginated: PaginatePage<Model, string> | { status: number; error: string },
): void {
  if ("error" in paginated) {
    res.status(paginated.status).json({ error: paginated.error });
  } else {
    res.json(paginated);
  }
}
