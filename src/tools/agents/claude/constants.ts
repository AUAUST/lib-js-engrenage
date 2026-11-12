import { freeze } from "@auaust/toolkit/object";

import type { HookDefinition } from "#tools/agents/types/HookDefinition";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export const claudeFile = "CLAUDE.md" satisfies File;

export const claudeSettingsFile = ".claude/settings.json" satisfies File;

export const claudeShellVariable = "CLAUDECODE";

export const claudeHookPrefix = "pnpm --silent engrenage agents claude hook ";

export const claudeHooks = freeze([
  ...(["create", "edit", "comment"] as const).map((verb) => {
    return {
      event: "PreToolUse",
      matcher: "Bash",
      condition: `Bash(gh issue ${verb} *)`,
      command: `${claudeHookPrefix}github`,
      onFailure: "block",
    } as const satisfies HookDefinition;
  }),
  ...(["commit", "-c", "-C", "config"] as const).map((start) => {
    return {
      event: "PreToolUse",
      matcher: "Bash",
      condition: `Bash(git ${start} *)`,
      command: `${claudeHookPrefix}git`,
      onFailure: "block",
    } as const satisfies HookDefinition;
  }),
  {
    event: "PreToolUse",
    matcher: "Agent|Task",
    command: `${claudeHookPrefix}dispatch`,
    onFailure: "block",
  } as const satisfies HookDefinition,
]) satisfies readonly HookDefinition[];

export const claudeStopHook = freeze({
  command: `${claudeHookPrefix}stop`,
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
