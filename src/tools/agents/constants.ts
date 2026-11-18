import { function_, looseObject, optional, string } from "valibot";
import type { StandardSchemaV1 } from "@standard-schema/spec";

import { freeze } from "@auaust/toolkit/object";

import { engrenage } from "#constants";
import { claudeShellVariable } from "#tools/agents/claude/constants";
import type { Agent } from "#tools/agents/types/Agent";
import type { AgentTokens } from "#tools/agents/types/AgentTokens";
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

export const agentsFile = "AGENTS.md" satisfies File;

export const agentsTemplate = `${engrenage}/agents/templates/${agentsFile}`;

export const agentsTarget = "agents";

// @debt Codex has no shell detector here, so its commits select only local-file checks instead of the full agent gate
export const agentShellVariables = freeze({
  claude: claudeShellVariable,
} as const) satisfies Partial<Record<Agent, string>>;

// @debt typed as StandardSchemaV1 to pass auaust/readonly-constants, erasing the validator's output type
export const agentRuntimeEntry: StandardSchemaV1 = looseObject({
  name: string(),
  title: optional(string()),
  dispatcher: optional(looseObject({ load: function_() })),
});

// @debt typed as StandardSchemaV1 to pass auaust/readonly-constants, erasing the validator's output type
export const agentLoaderEntry: StandardSchemaV1 = looseObject({
  name: string(),
  load: function_(),
});

export const backlogIndex = ".ai/backlog/index.md" satisfies File;

export const backlogCategoriesHeading = "## Open categories";

export const backlogTemplate = `${engrenage}/agents/templates/backlog.md`;

export const agentLogFiles = freeze([
  ".ai/friction.md",
  ".ai/discarded.md",
] as const) satisfies Globs;

export const handoffsDirectory = ".ai/handoffs/" satisfies Directory;

export const scratchpadFile = ".ai/scratchpad.md" satisfies File;

export const scratchpadPlaceholder = "Write ideas, bugs and follow-ups here, one per line; the curator turns them into backlog entries and issues.";

export const preserveDirective = "@preserve";

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

export const codexSkillFrontmatterKeys = freeze([
  "name",
  "description",
] as const);

export const ruleFrontmatterKeys = freeze(["paths"] as const);

export const attributionRules = freeze({
  true: "attribution",
  false: "no-attribution",
} as const);

export const rulesDirectory = ".claude/rules" satisfies Directory;

export const budgetKinds = freeze([
  "goal",
  "context",
  "doneWhen",
  "comment",
  "backlogEntry",
] as const);

export const budgetModes = freeze(["warn", "deny"] as const);

export const defaultBudgetMode = "warn" as const;

export const defaultBudgets = freeze({
  goal: 60,
  context: 80,
  doneWhen: 60,
  comment: 150,
  backlogEntry: 60,
} as const);

export const efforts = freeze([
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
] as const);

export const subagentCacheTtls = freeze(["5m", "1h"] as const);

export const defaultSubagentCacheTtl = "1h" as const;

export const hookEvents = freeze([
  "PreToolUse",
  "PostToolUse",
  "Stop",
  "SubagentStart",
  "SubagentStop",
] as const);

export const agentStatsDirectory = ".ai/stats" satisfies Directory;

export const mainAgent = "main";

export const tokenWeights = freeze({
  input: 1,
  cacheRead: 0.1,
  cacheWrite5m: 1.25,
  cacheWrite1h: 2,
  output: 5,
} as const) satisfies Record<keyof AgentTokens, number>;

export const defaultInstructionFiles = freeze([
  "AGENTS.md",
  ".claude/rules/**/*.md",
  ".claude/skills/*/SKILL.md",
  ".claude/agents/*.md",
  ".agents/skills/*/SKILL.md",
] as const) satisfies Globs;

export const tableCellWords = 25;
