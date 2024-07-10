import { Column, DataType, Model, Table } from "sequelize-typescript";

// Implements storage for Automerge history entries (incremental changes and snapshots).
// https://automerge.org/docs/under-the-hood/storage/#the-storage-model
@Table({
  // https://github.com/sequelize/sequelize-typescript/issues/105#issuecomment-832075653
  indexes: [
    {
      name: "automerge_entry_key",
      fields: ["key0", "key1", "key2"],
      unique: true,
    },
  ],
})
export class AutomergeEntry extends Model<AutomergeEntry> {
  @Column
  declare key0: string;

  @Column
  declare key1: string;

  @Column
  declare key2: string;

  @Column(DataType.BLOB)
  declare value: Uint8Array;
}
