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
