import { freeze } from "@auaust/toolkit/object";

import type { HookDefinition } from "#tools/agents/types/HookDefinition";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export const claudeFile = "CLAUDE.md" satisfies File;

export const claudeSettingsFile = ".claude/settings.json" satisfies File;

// @debt Edits made through Bash (sed, scripts, codemods) never match this matcher, so they skip formatting and lint; nothing at commit time catches what the hook misses.
// @debt The command runs the project's own CLI, so whenever the project fails to load (mid-refactor in engrenage itself, a broken config) the hook exits non-blocking and edits go unformatted without the agent knowing.
export const claudeEditHook = freeze({
  event: "PostToolUse",
  matcher: "Edit|MultiEdit|Write",
  command: "pnpm --silent engrenage agents claude hook edit",
} as const) satisfies HookDefinition;

export const claudeGithubHook = freeze({
  event: "PreToolUse",
  matcher: "Bash",
  condition: "Bash(gh issue *)",
  command: "pnpm --silent engrenage agents claude hook github",
} as const) satisfies HookDefinition;

export const claudeHiddenAttribution = freeze({
  commit: "",
  pr: "",
  sessionUrl: false,
} as const);

export const claudeRulesGlob = ".claude/rules/**/*.md";

export const claudeSkillsDir = ".claude/skills" satisfies Directory;

export const claudeAgentsDir = ".claude/agents" satisfies Directory;
