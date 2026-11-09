import type { Extension } from "#project/config/index";

import claude from "#tools/agents/claude/extension";
import codex from "#tools/agents/codex/extension";

export default [
  {
    name: "tools/agents",
    owns: {
      keys: {
        agents: {
          input: "agents",
          async load() {
            const { agentsSection } =
              await import("#tools/agents/config/sections/agentsSection");

            return agentsSection;
          },
        },
      },
    },
  },
  claude,
  codex,
] satisfies readonly Extension[];
