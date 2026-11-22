import { function_, looseObject, optional, string } from "valibot";
import type { StandardSchemaV1 } from "@standard-schema/spec";

import { freeze } from "@auaust/toolkit/object";

import { engrenage } from "#constants";
import { claudeShellVariable } from "#tools/agents/claude/constants";
import { statsDirectory } from "#tools/agents/metalbrain/constants";
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

export const metalbrain = "metalbrain";

export const sharedFilesKind = "shared";

// @debt the main session's shared files sit under `.claude` though `AGENTS.md` names them to every runtime
export const mainSharedDirectory = ".claude/shared" satisfies Directory;

export const mainSharedFiles = freeze(["request-analysis.md"] as const);

export const agentsTemplate = `${engrenage}/${metalbrain}/templates/${agentsFile}`;

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
  skills: optional(string()),
  agents: optional(string()),
});

// @debt typed as StandardSchemaV1 to pass auaust/readonly-constants, erasing the validator's output type
export const agentLoaderEntry: StandardSchemaV1 = looseObject({
  name: string(),
  load: function_(),
});

export const builtInFillers = freeze([
  "skill-file",
  "shared-file",
  "extension",
  "file",
] as const);

export const backlogIndex = ".ai/backlog/index.md" satisfies File;

export const backlogCategoriesHeading = "## Open categories";

export const backlogTemplate = `${engrenage}/${metalbrain}/templates/backlog.md`;

export const agentLogFiles = freeze([
  ".ai/friction.md",
  ".ai/discarded.md",
] as const) satisfies Globs;

export const handoffsDirectory = ".ai/handoffs/" satisfies Directory;

export const scratchpadFile = ".ai/scratchpad.md" satisfies File;

export const scratchpadPlaceholder = "Write ideas, bugs and follow-ups here, one per line; curation turns them into backlog entries and issues.";

export const preserveDirective = "@preserve";

export const skillFileName = "SKILL.md" satisfies File;

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

export const retiredRules = freeze([
  `${engrenage}/${metalbrain}/rules/instructions.md`,
] as const);

export const rulesDirectory = ".claude/rules" satisfies Directory;

export const addRuleCommand = "pnpm engrenage agents rules add";

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
  goal: 150,
  context: 150,
  doneWhen: 150,
  comment: 150,
  backlogEntry: 100,
} as const);

export const defaultOutputLimit = 10_000;

export const efforts = freeze([
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
] as const);

export const subagentCacheTtls = freeze(["5m", "1h"] as const);

export const defaultSubagentCacheTtl = "5m" as const;

export const hookEvents = freeze([
  "PreToolUse",
  "PostToolUse",
  "Stop",
  "SubagentStart",
  "SubagentStop",
] as const);

export const agentStatsDirectory = statsDirectory satisfies Directory;

export const tokenWeights = freeze({
  input: 1,
  cacheRead: 0.1,
  cacheWrite5m: 1.25,
  cacheWrite1h: 2,
  output: 5,
} as const) satisfies Record<keyof AgentTokens, number>;

export const unknownModel = "unknown";

export const standardTier = "standard";

export const fastTier = "fast";

export const defaultInstructionFiles = freeze([
  "AGENTS.md",
  ".claude/rules/**/*.md",
  ".claude/skills/*/*.md",
  ".claude/agents/*.md",
  `${mainSharedDirectory}/*.md`,
  ".agents/skills/*/*.md",
] as const) satisfies Globs;

export const tableCellWords = 25;

export { mainAgent } from "#tools/agents/metalbrain/constants";

export const agentRunExtensions = freeze({
  recorded: ".json",
  running: ".running",
} as const);

export const reportMarkers = freeze([
  { outcome: "budget", marker: "Budget stop:" },
  { outcome: "scope", marker: "Scope stop:" },
  { outcome: "linked", marker: "Linked defect:" },
] as const);

export const agentOutcomes = freeze([
  "completion",
  "budget",
  "scope",
  "linked",
  "unreported",
] as const);
