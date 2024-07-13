import { Repo } from "@automerge/automerge-repo";
import { NodeWSServerAdapter } from "@automerge/automerge-repo-network-websocket";
import { WebSocketServer } from "ws";
import { NybblerSqlStorageAdapter } from "./automerge/sql_storage_adapter.js";

export let repo: Repo;

export function runAutomergeService(wss: WebSocketServer) {
  const wssAdapter = new NodeWSServerAdapter(wss);

  repo = new Repo({
    storage: new NybblerSqlStorageAdapter(),
    network: [wssAdapter],
    sharePolicy: async (peerId, documentId) => true,
  });
}
