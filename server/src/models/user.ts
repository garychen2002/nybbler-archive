import {
  BelongsToMany,
  Column,
  HasMany,
  IsEmail,
  Model,
  Table,
  Unique,
} from "sequelize-typescript";
import { Invite } from "./invite.ts";
import { Project } from "./project.ts";

@Table
export class User extends Model<User> {
  /** User's preferred name. */
  @Column
  declare name: string;

  /** Email address. */
  @Unique
  @IsEmail
  @Column
  declare email: string;

  /** Owned projects. */
  @HasMany(() => Project)
  projects!: Project[];

  /** Projects user was invited to. */
  @BelongsToMany(() => Project, () => Invite)
  invitedProjects!: Project[];
}
