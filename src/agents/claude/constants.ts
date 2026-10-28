import { freeze } from "@auaust/toolkit/object";

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

export const claudeRulesGlob = ".claude/rules/**/*.md";
