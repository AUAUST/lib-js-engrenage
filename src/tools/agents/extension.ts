import {
  agentLoaderEntry,
  agentRuntimeEntry,
  agentsTarget,
} from "#tools/agents/constants";
import type { Extension, FileLocation } from "#project/config/index";

export default {
  name: "tools/agents",
  owns: {
    slots: {
      "agents.runtimes": { entry: agentRuntimeEntry },
      "agents.fillers": { entry: agentLoaderEntry },
      "agents.rules": { entry: agentLoaderEntry },
    },
    keys: {
      agents: {
        input: "agents",
        async load() {
          const {
            agentsSection,
          } = await import("#tools/agents/config/sections/agentsSection");

          return agentsSection;
        },
      },
    },
    files: {
      "agents.instructions": {
        async locate(config): Promise<FileLocation | undefined> {
          const { instructionFiles } = await config.resolve("agents");

          return { globs: instructionFiles };
        },
      },
    },
  },
  contributes: {
    "sync.targets": [
      {
        name: agentsTarget,
        stage: "write",
        reads: ["tsconfig"],
        produces: ["agents.instructions"],
        async load() {
          const { syncAgents } = await import("#tools/agents/setup/syncAgents");

          return syncAgents;
        },
      },
    ],
    "sync.done": [
      {
        async load() {
          const {
            reportSyncedAgentChecks,
          } = await import("#tools/agents/operations/reportSyncedAgentChecks");

          return reportSyncedAgentChecks;
        },
      },
    ],
  },
} satisfies Extension;
