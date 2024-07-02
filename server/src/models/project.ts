import {
  BelongsTo,
  BelongsToMany,
  Column,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from "sequelize-typescript";
import { Binary } from "./binary.ts";
import { Invite } from "./invite.ts";
import { User } from "./user.ts";

@Table
export class Project extends Model<Project> {
  /** User-specified project name. */
  @Column
  declare name: string;

  /** Owning user. */
  @BelongsTo(() => User, { onDelete: "cascade" })
  owner!: User;

  /** Owning user ID. */
  @ForeignKey(() => User)
  @Column
  declare ownerId: number;

  /** Invited users. */
  @BelongsToMany(() => User, () => Invite)
  invitees!: User;

  /** Binaries in the project. */
  @HasMany(() => Binary)
  binaries!: Binary[];
}
