import { agentRuntimeEntry, agentsTarget } from "#tools/agents/constants";
import type { Extension, FileLocation } from "#project/config/index";

// @debt should consider a `declareExtension` utility that simplifies the declaration
export default {
  name: "tools/agents",
  owns: {
    slots: {
      "agents.runtimes": { entry: agentRuntimeEntry },
    },
    keys: {
      agents: {
        input: "agents",
        // @debt consider a more concise way to load sections given all sections follow a similar import pattern; defineLazyCommand() might serve as a ref; maybe a shared small lazy loader utility is worth it so formalise the pattern
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
