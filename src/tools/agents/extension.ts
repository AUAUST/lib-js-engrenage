import type { Extension } from "#project/config/index";

import claude from "#tools/agents/claude/extension";
import codex from "#tools/agents/codex/extension";

export default [
  { name: "tools/agents" },
  claude,
  codex,
] satisfies readonly Extension[];
