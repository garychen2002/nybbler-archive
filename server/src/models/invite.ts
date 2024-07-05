import { Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { Project } from "./project.js";
import { User } from "./user.js";

@Table
export class Invite extends Model<Invite> {
  @ForeignKey(() => User)
  @Column
  declare userId: number;

  @ForeignKey(() => Project)
  @Column
  declare projectId: number;
}
