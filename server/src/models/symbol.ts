import {
  AllowNull,
  BelongsTo,
  Column,
  ForeignKey,
  HasOne,
  Model,
  Table,
} from "sequelize-typescript";
import { Binary } from "./binary.js";
import { Function } from "./function.js";

@Table
export class Symbol extends Model<Symbol> {
  @Column
  declare name: string;

  @Column
  declare address: string;

  /** Owning binary. */
  @BelongsTo(() => Binary)
  // https://github.com/sequelize/sequelize-typescript/issues/825#issuecomment-1147027162
  binary!: ReturnType<() => Binary>;

  /** Owning binary ID. */
  @ForeignKey(() => Binary)
  @Column
  declare binaryId: number;

  @HasOne(() => Function)
  function?: ReturnType<() => Function>;

  @ForeignKey(() => Function)
  @AllowNull
  @Column
  declare functionId: number;
}
