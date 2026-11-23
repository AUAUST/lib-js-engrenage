import { freeze } from "@auaust/toolkit/object";

import { engrenage } from "#constants";
import type { WordCapKind } from "#metalbrain/facts/index";
import type { InstructionKind } from "#metalbrain/instructions/types/InstructionKind";
import type { BlockSyntax } from "#types/BlockSyntax";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";

export const markdownBlocks = freeze({
  open: "<!-- ",
  close: " -->",
  padding: "\n\n",
} as const) satisfies BlockSyntax;

// @debt the marker repeats the form of `formatBlockMarker`, which this pure module cannot import from its confined role
export const endMarker = `${markdownBlocks.open}@end${markdownBlocks.close}`;

export const metalbrain = "metalbrain";

export const sharedFilesKind = "shared";

export const preserveDirective = "@preserve";

export const backlogCategoriesHeading = "## Open categories";

export const backlogTemplate = `${engrenage}/${metalbrain}/templates/backlog.md`;

export const rulesDirectory = ".claude/rules" satisfies Directory;

export const wordCapLabels = freeze({
  goal: "Issue **Goal**",
  context: "Issue **Context**",
  doneWhen: "Issue **Done when**",
  comment: "Issue comment",
  backlogEntry: "Backlog entry",
  logEntry: "Agent log entry",
} as const satisfies Record<WordCapKind, string>);

export const agentsFile = "AGENTS.md" satisfies File;

// @debt the main session's shared files sit under `.claude` though `AGENTS.md` names them to every runtime
export const mainSharedDirectory = ".claude/shared" satisfies Directory;

export const mainSharedFiles = freeze(["request-analysis.md"] as const);

export const agentsTemplate = `${engrenage}/${metalbrain}/templates/${agentsFile}`;

export const builtInFillers = freeze([
  "word-caps",
  "agent-limits",
  "skill-file",
  "shared-file",
  "extension",
  "file",
] as const);

export const handoffsDirectory = ".ai/handoffs/" satisfies Directory;

export const ruleFrontmatterKeys = freeze(["paths"] as const);

export const attributionRules = freeze({
  true: "attribution",
  false: "no-attribution",
} as const);

export const retiredRules = freeze([
  `${engrenage}/${metalbrain}/rules/instructions.md`,
] as const);

export const defaultInstructionFiles = freeze([
  "AGENTS.md",
  ".claude/rules/**/*.md",
  ".claude/skills/*/*.md",
  ".claude/agents/*.md",
  `${mainSharedDirectory}/*.md`,
] as const) satisfies Globs;

export const tableCellWords = 25;

export const instructionDirectories = freeze({
  section: "sections",
  rule: "rules",
  skill: "skills",
} as const satisfies Record<InstructionKind, string>);
