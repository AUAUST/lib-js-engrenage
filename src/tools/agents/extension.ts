import { agentsTarget } from "#tools/agents/constants";
import type { Extension, FileLocation } from "#project/config/index";

import claude from "#tools/agents/claude/extension";
import codex from "#tools/agents/codex/extension";

// @debt should consider a `declareExtension` utility that simplifies the declaration; it would likely take a spread of extension definitions to support one or multiple extensions seemlessly
export default [
  {
    name: "tools/agents",
    owns: {
      keys: {
        agents: {
          input: "agents",
          // @debt consider a more concise way to load sections given all sections follow a similar import pattern; defineLazyCommand() might serve as a ref; maybe a shared small lazy loader utility is worth it so formalise the pattern
          async load() {
            const { agentsSection } =
              await import("#tools/agents/config/sections/agentsSection");

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
            const { syncAgents } =
              await import("#tools/agents/setup/syncAgents");

            return syncAgents;
          },
        },
      ],
      "sync.done": [
        {
          async load() {
            const { reportSyncedAgentChecks } =
              await import("#tools/agents/operations/reportSyncedAgentChecks");

            return reportSyncedAgentChecks;
          },
        },
      ],
    },
  },
  claude,
  codex,
] satisfies readonly Extension[];
