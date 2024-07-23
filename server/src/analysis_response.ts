import { Job, QueueEvents } from "bullmq";
import { analysisQueue } from "./app.js";
import { repo } from "./automerge.js";
import { CollabBinary, CollabProject } from "./models/_collab.js";
import { Binary } from "./models/binary.js";
import { Project } from "./models/project.js";
import { RedisConnectionOptions } from "./shared.js";

export function runAnalysisResponseService() {
  const queueEvents = new QueueEvents("Analysis", { connection: RedisConnectionOptions });

  queueEvents.on("completed", async ({ jobId }) => {
    console.error(`queued job ${jobId} completed`);

    const job = await Job.fromId(analysisQueue, jobId);

    switch (job?.name) {
      case "Analyze":
        return await handleAnalyzeResponse(job, "complete");

      default:
        // Some other job, we don't care
        return;
    }
  });

  queueEvents.on("failed", async ({ jobId, failedReason }) => {
    console.error(`queued job ${jobId} failed: ${failedReason}`);

    const job = await Job.fromId(analysisQueue, jobId);

    switch (job?.name) {
      case "Analyze":
        return await handleAnalyzeResponse(job, "complete");

      default:
        // Some other job, we don't care
        return;
    }
  });
}

async function handleAnalyzeResponse(job: Job, status: CollabBinary["analysisStatus"]) {
  const binaryId = job.data.binaryId;

  if (binaryId === undefined) {
    return console.error(`binary analysis: ID of Binary record required`);
  }

  const project = await Project.findOne({
    include: {
      model: Binary,
      where: { id: binaryId },
    },
    attributes: ["automergeDocumentId"],
  });
  if (!project) {
    return console.error(`binary analysis: no Project for Binary record with ID: ${binaryId}`);
  }

  const docHandle = repo.find<CollabProject>(project.automergeDocumentId);
  await docHandle.whenReady();

  docHandle.change((doc) => {
    doc.binaries ??= {};
    doc.binaries[binaryId] ??= {};
    doc.binaries[binaryId].analysisStatus = status;
  });
}
