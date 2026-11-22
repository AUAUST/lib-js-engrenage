import { freeze } from "@auaust/toolkit/object";

import { engrenage } from "#constants";
import { metalbrain } from "#metalbrain/instructions/constants";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";

export const agentsFile = "AGENTS.md" satisfies File;

// @debt the main session's shared files sit under `.claude` though `AGENTS.md` names them to every runtime
export const mainSharedDirectory = ".claude/shared" satisfies Directory;

export const mainSharedFiles = freeze(["request-analysis.md"] as const);

export const agentsTemplate = `${engrenage}/${metalbrain}/templates/${agentsFile}`;

export const builtInFillers = freeze([
  "skill-file",
  "shared-file",
  "extension",
  "file",
] as const);

export const handoffsDirectory = ".ai/handoffs/" satisfies Directory;

export const scratchpadFile = ".ai/scratchpad.md" satisfies File;

export const scratchpadPlaceholder = "Write ideas, bugs and follow-ups here, one per line; curation turns them into backlog entries and issues.";

export const skillFileName = "SKILL.md" satisfies File;

export const skillFrontmatterKeys = freeze(["name", "description"] as const);

export const claudeSkillFrontmatterKeys = freeze([
  "name",
  "description",
  "disable-model-invocation",
] as const);

export const claudeAgentFrontmatterKeys = freeze([
  "name",
  "description",
  "model",
  "effort",
  "tools",
  "disallowedTools",
  "hooks",
] as const);

export const ruleFrontmatterKeys = freeze(["paths"] as const);

export const attributionRules = freeze({
  true: "attribution",
  false: "no-attribution",
} as const);

export const retiredRules = freeze([
  `${engrenage}/${metalbrain}/rules/instructions.md`,
] as const);

export const defaultOutputLimit = 10_000;

export const defaultSubagentCacheTtl = "5m" as const;

export const defaultInstructionFiles = freeze([
  "AGENTS.md",
  ".claude/rules/**/*.md",
  ".claude/skills/*/*.md",
  ".claude/agents/*.md",
  `${mainSharedDirectory}/*.md`,
] as const) satisfies Globs;

export const tableCellWords = 25;
