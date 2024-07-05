import { BelongsToMany, Column, HasMany, Model, Table } from "sequelize-typescript";
import { Binary } from "./binary.js";
import { Invite } from "./invite.js";
import { User } from "./user.js";

@Table
export class Project extends Model<Project> {
  /** User-specified project name. */
  @Column
  declare name: string;

  /** Invited users. */
  @BelongsToMany(() => User, () => Invite)
  invitees!: User;

  /** Binaries in the project. */
  @HasMany(() => Binary)
  binaries!: Binary[];
}
