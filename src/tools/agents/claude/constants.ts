import { freeze } from "@auaust/toolkit/object";

import { hookProgram } from "#constants";
import {
  metalbrainProgram,
  metalbrainProgramSource,
} from "#metalbrain/runtimes/constants";
import type { HookDefinition } from "#metalbrain/runtimes/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export const claudeFile = "CLAUDE.md" satisfies File;

export const claudeSettingsFile = ".claude/settings.json" satisfies File;

export const claudeBinary = "claude";

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
  `${metalbrainProgram} hook claude `,
  "engrenage agents claude hook ",
] as const);

export const metalbrainHook = freeze({
  name: metalbrainProgram,
  source: metalbrainProgramSource,
} as const);

export const claudeHooks = freeze([
  {
    event: "PreToolUse",
    matcher: "Bash|Agent|Task|SendMessage",
    args: "hook claude PreToolUse guardToolUse",
    program: metalbrainHook,
  },
  {
    event: "PostToolUse",
    matcher: "Bash",
    args: "hook claude PostToolUse limitOutput",
    async: true,
    program: metalbrainHook,
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
    args: "hook claude SubagentStart",
    async: true,
    program: metalbrainHook,
  },
  {
    event: "Stop",
    matcher: "*",
    args: "hook claude Stop",
    async: true,
    program: metalbrainHook,
  },
  {
    event: "SubagentStop",
    matcher: "*",
    args: "hook claude SubagentStop",
    async: true,
    program: metalbrainHook,
  },
  {
    event: "PreToolUse",
    matcher: "*",
    args: "hook claude PreToolUse",
    async: true,
    program: metalbrainHook,
  },
  {
    event: "PostToolUse",
    matcher: "*",
    args: "hook claude PostToolUse",
    async: true,
    program: metalbrainHook,
  },
] as const) satisfies readonly HookDefinition[];

export const claudeStopHook = freeze({
  args: "claude Stop skill",
} as const);

export const claudeThoroughnessHookArgs = "hook claude thoroughness --level";

// @debt permission entries are add-only: one engrenage stops producing stays in consumers' settings until sync records what it wrote (#229, #105)
export const claudePermissions = freeze({
  deny: [
    "Bash(git commit --no-verify*)",
    "Bash(git commit -n*)",
    "Bash(LEFTHOOK=0 *)",
    "Bash(LEFTHOOK=false *)",
    "Bash(git config core.hooksPath*)",
    "Bash(git push*)",
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

export const mainRole = "main";
