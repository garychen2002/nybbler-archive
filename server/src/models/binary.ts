import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from "sequelize-typescript";
import { Project } from "./project.js";
import { Symbol } from "./symbol.js";

@Table
export class Binary extends Model<Binary> {
  /** User-specified name. */
  @Column
  declare name: string;

  /** Uploaded file information. */
  @Column(DataType.JSON)
  declare file: Express.Multer.File;

  /** Owning project. */
  @BelongsTo(() => Project, { onDelete: "cascade" })
  project!: Project;

  /** Owning project ID. */
  @ForeignKey(() => Project)
  @Column
  declare projectId: number;

  /** Symbols found in this binary. */
  @HasMany(() => Symbol)
  symbols!: Symbol[];

  @Column
  declare md5hash: string;
}
