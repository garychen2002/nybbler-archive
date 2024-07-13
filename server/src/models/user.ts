import { BelongsToMany, Column, Model, Table, Unique } from "sequelize-typescript";
import { Invite } from "./invite.js";
import { Project } from "./project.js";

@Table
export class User extends Model<User> {
  /** GitHub username. */
  @Unique
  @Column
  declare username: string;

  /** User's preferred name. */
  @Column
  declare name: string;

  /** Projects user was invited to. */
  @BelongsToMany(() => Project, () => Invite)
  invitedProjects!: Project[];
}
