import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Symbol } from "./symbol.js";

@Table
export class Function extends Model<Function> {
  /** Disassembled version of function body. */
  @Column(DataType.TEXT)
  declare disassembly: string;

  /** Symbol that points to this function. */
  @BelongsTo(() => Symbol, { onDelete: "cascade" })
  symbol!: ReturnType<() => Symbol>;

  /** Owning symbol ID. */
  @ForeignKey(() => Symbol)
  @Column
  declare symbolId: number;
}
