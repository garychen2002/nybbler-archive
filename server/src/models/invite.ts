import { Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { Project } from "./project.ts";
import { User } from "./user.ts";

@Table
export class Invite extends Model<Invite> {
  @ForeignKey(() => User)
  @Column
  declare userId: number;

  @ForeignKey(() => Project)
  @Column
  declare projectId: number;
}
