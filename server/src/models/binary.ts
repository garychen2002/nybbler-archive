import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Project } from "./project.ts";

@Table
export class Binary extends Model<Binary> {
  /** User-specified name. */
  @Column
  declare name: string;

  /** Uploaded file information. */
  @Column(DataType.JSON)
  declare file: Express.Multer.File;

  /** Path to symbols.json file. */
  @Column
  declare symbols: string;

  /** Owning project. */
  @BelongsTo(() => Project, { onDelete: "cascade" })
  project!: Project;

  /** Owning project ID. */
  @ForeignKey(() => Project)
  @Column
  projectId!: number;
}
