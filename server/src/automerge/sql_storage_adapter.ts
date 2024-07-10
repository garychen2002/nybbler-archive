import { Chunk, StorageAdapterInterface, StorageKey } from "@automerge/automerge-repo";
import { Op, WhereOptions } from "sequelize";
import { AutomergeEntry } from "../models/automerge_entry.js";

function queryFromAutomergeKey(key: StorageKey): WhereOptions<AutomergeEntry> {
  let where: WhereOptions<AutomergeEntry> = {};

  if (key[0] !== undefined) where.key0 = key[0];
  if (key[1] !== undefined) where.key1 = key[1];
  if (key[2] !== undefined) where.key2 = key[2];

  return where;
}

function automergeChunkFromEntry(entry: AutomergeEntry): Chunk {
  console.log(entry.value.toString());
  return { key: [entry.key0, entry.key1, entry.key2], data: entry.value };
}

// https://automerge.org/docs/under-the-hood/storage/#the-storage-model
export class NybblerSqlStorageAdapter implements StorageAdapterInterface {
  async load(key: StorageKey): Promise<Uint8Array | undefined> {
    await AutomergeEntry.destroy({ where: { id: { [Op.gt]: 0 } } });
    const entry = await AutomergeEntry.findOne({
      attributes: ["value"],
      where: queryFromAutomergeKey(key),
    });
    if (entry) return entry.value;
  }

  async save(key: StorageKey, data: Uint8Array): Promise<void> {
    // @ts-ignore
    await AutomergeEntry.upsert({
      ...queryFromAutomergeKey(key),
      value: Buffer.from(data),
    });
    console.log("Automerge entry saved");
  }

  async remove(key: StorageKey): Promise<void> {
    await AutomergeEntry.destroy({
      where: queryFromAutomergeKey(key),
    });
  }

  async loadRange(keyPrefix: StorageKey): Promise<Chunk[]> {
    const entries = await AutomergeEntry.findAll({
      where: queryFromAutomergeKey(keyPrefix),
    });
    return entries.map(automergeChunkFromEntry);
  }

  async removeRange(keyPrefix: StorageKey): Promise<void> {
    await AutomergeEntry.destroy({
      where: queryFromAutomergeKey(keyPrefix),
    });
  }
}
