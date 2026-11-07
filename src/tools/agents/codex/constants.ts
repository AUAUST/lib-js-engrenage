import { freeze } from "@auaust/toolkit/object";

import { engrenage } from "#constants";
import type { HookDefinition } from "#tools/agents/types/HookDefinition";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export const codexFile = "AGENTS.override.md" satisfies File;

export const codexTemplate = `${engrenage}/agents/templates/${codexFile}`;

export const codexHooksFile = ".codex/hooks.json" satisfies File;

export const codexHookPrefix = "pnpm --silent engrenage agents codex hook ";

export const codexHooks = freeze([
  {
    event: "PreToolUse",
    matcher: "^(spawn_agent|Agent)$",
    command: `${codexHookPrefix}dispatch`,
  },
  {
    event: "SubagentStop",
    matcher: ".*",
    command: `${codexHookPrefix}stop`,
  },
  {
    event: "PreToolUse",
    matcher: "^Bash$",
    command: `${codexHookPrefix}github`,
  },
] as const) satisfies readonly HookDefinition[];

// @debt Codex has no git bypass guard; its hook entries cannot filter on the command
// @debt Codex commits skip the gate until a variable Codex sets in its shells is known
export const codexAgentsDir = ".codex/agents" satisfies Directory;

export const codexSkillsDir = ".agents/skills" satisfies Directory;
