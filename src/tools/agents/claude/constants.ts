import { freeze } from "@auaust/toolkit/object";

import { hookProgram } from "#constants";
import type { HookDefinition } from "#tools/agents/types/HookDefinition";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export const claudeFile = "CLAUDE.md" satisfies File;

export const claudeSettingsFile = ".claude/settings.json" satisfies File;

export const claudeBinary = "claude";

export const claudeShellVariable = "CLAUDECODE";

export const claudeSessionVariable = "CLAUDE_CODE_SESSION_ID";

// @debt the kept names guess which `CLAUDE` variables a user configures, as Claude Code documents no split from those it sets for its own session and the processes it starts
export const claudeVariables = freeze({
  prefix: "CLAUDE",
  kept: [
    "CLAUDE_CONFIG_DIR",
    "CLAUDE_CODE_OAUTH_TOKEN",
    "CLAUDE_CODE_USE_BEDROCK",
    "CLAUDE_CODE_USE_VERTEX",
    "CLAUDE_CODE_USE_FOUNDRY",
  ],
} as const);

// @debt the legacy marker only cleans settings synced before engrenage-hook
export const claudeHookMarkers = freeze([
  `${hookProgram} claude `,
  "engrenage agents claude hook ",
] as const);

export const claudeHooks = freeze([
  {
    event: "PreToolUse",
    matcher: "Bash|Agent|Task|SendMessage",
    args: "claude PreToolUse",
  },
  {
    event: "PostToolUse",
    matcher: "Edit|MultiEdit|Write",
    args: "claude PostToolUse",
    async: true,
  },
  {
    event: "SubagentStart",
    matcher: "*",
    args: "claude SubagentStart",
    async: true,
  },
  {
    event: "Stop",
    matcher: "*",
    args: "claude Stop",
    async: true,
  },
  {
    event: "SubagentStop",
    matcher: "*",
    args: "claude SubagentStop",
    async: true,
  },
] as const) satisfies readonly HookDefinition[];

export const claudeStopHook = freeze({
  args: "claude Stop skill",
} as const);

// @debt permission entries are add-only: one engrenage stops producing stays in consumers' settings until sync records what it wrote (#229, #105)
export const claudePermissions = freeze({
  deny: [
    "Bash(git commit --no-verify*)",
    "Bash(git commit -n*)",
    "Bash(LEFTHOOK=0 *)",
    "Bash(LEFTHOOK=false *)",
    "Bash(git config core.hooksPath*)",
  ],
} as const);

export const claudeHiddenAttribution = freeze({
  commit: "",
  pr: "",
  sessionUrl: false,
} as const);

export const claudeRulesGlob = ".claude/rules/**/*.md";

export const claudeSkillsDir = ".claude/skills" satisfies Directory;

export const claudeAgentsDir = ".claude/agents" satisfies Directory;

export const claudeTarget = "claude";
