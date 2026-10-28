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

export const agentNames = freeze(["claude", "codex"] as const);

export const backlogIndex = ".ai/backlog/index.md" satisfies File;

export const legacyBacklog = ".claude/backlog.md" satisfies File;

export const backlogTemplate = `${engrenage}/agents/templates/backlog.md`;
