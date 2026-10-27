import { freeze } from "@auaust/toolkit/object";

import { engrenage } from "#constants";
import type { BlockSyntax } from "#types/BlockSyntax";
import type { File } from "#types/File";

export const markdownBlocks = freeze({
  open: "<!-- ",
  close: " -->",
  padding: "\n\n",
} as const) satisfies BlockSyntax;

export const agentsFile = "AGENTS.md" satisfies File;

export const agentsTemplate = `${engrenage}/agents/templates/${agentsFile}`;

export const claudeFile = "CLAUDE.md" satisfies File;

export const claudeSettingsFile = ".claude/settings.json" satisfies File;

export const editHookCommand = "pnpm --silent engrenage claude hook edit";

export const editHook = freeze({
  matcher: "Edit|MultiEdit|Write",
  hooks: [
    {
      type: "command",
      command: editHookCommand,
    },
  ],
} as const);
