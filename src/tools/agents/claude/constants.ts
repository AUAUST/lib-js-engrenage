import { freeze } from "@auaust/toolkit/object";

import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export const claudeFile = "CLAUDE.md" satisfies File;

export const claudeSettingsFile = ".claude/settings.json" satisfies File;

export const claudeEditHookCommand =
  "pnpm --silent engrenage agents claude hook edit";

export const claudeEditHook = freeze({
  matcher: "Edit|MultiEdit|Write",
  hooks: [
    {
      type: "command",
      command: claudeEditHookCommand,
    },
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
