import { UUIDV4 } from "sequelize";
import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
  Unique,
} from "sequelize-typescript";
import { User } from "./user.js";

@Table
export class Session extends Model<Session> {
  @Unique
  @Default(UUIDV4)
  @Column(DataType.UUID)
  declare token: string;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => User)
  @Column
  declare userId: number;
}
