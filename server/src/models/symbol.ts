import { BelongsTo, Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { Binary } from "./binary.js";

@Table
export class Symbol extends Model<Symbol> {
  @Column
  declare name: string;

  @Column
  declare address: string;

  @Column
  declare type: string;

  @Column
  declare namespace: string;

  @Column
  declare source: string;

  /** Owning binary. */
  @BelongsTo(() => Binary)
  // https://github.com/sequelize/sequelize-typescript/issues/825#issuecomment-1147027162
  binary!: ReturnType<() => Binary>;

  /** Owning binary ID. */
  @ForeignKey(() => Binary)
  @Column
  declare binaryId: number;
}
