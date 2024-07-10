import type { DocumentId } from "@automerge/automerge-repo";
import { BelongsToMany, Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { Binary } from "./binary.js";
import { Invite } from "./invite.js";
import { User } from "./user.js";

@Table
export class Project extends Model<Project> {
  /** User-specified project name. */
  @Column
  declare name: string;

  /** Correponsding Automerge document ID; auto-generated by the library. */
  @Column(DataType.STRING)
  declare automergeDocumentId: DocumentId;

  /** Invited users. */
  @BelongsToMany(() => User, () => Invite)
  invitees!: User;

  /** Binaries in the project. */
  @HasMany(() => Binary)
  binaries!: Binary[];
}
