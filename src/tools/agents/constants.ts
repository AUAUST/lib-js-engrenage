import { function_, looseObject, optional, string } from "valibot";
import type { StandardSchemaV1 } from "@standard-schema/spec";

import { freeze } from "@auaust/toolkit/object";

import { engrenage } from "#constants";
import { claudeShellVariable } from "#tools/agents/claude/constants";
import type { Agent } from "#tools/agents/types/Agent";
import type { BlockSyntax } from "#types/BlockSyntax";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";

export const markdownBlocks = freeze({
  open: "<!-- ",
  close: " -->",
  padding: "\n\n",
} as const) satisfies BlockSyntax;

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
});

// @debt typed as StandardSchemaV1 to pass auaust/readonly-constants, erasing the validator's output type
export const agentLoaderEntry: StandardSchemaV1 = looseObject({
  name: string(),
  load: function_(),
});

export const backlogIndex = ".ai/backlog/index.md" satisfies File;

export const backlogTemplate = `${engrenage}/agents/templates/backlog.md`;

export const scratchpadFile = ".ai/scratchpad.md" satisfies File;

export const scratchpadPlaceholders = freeze([
  "UwU, drop your widdle dev dreams here and the sparkly backlog bun-bun will tuck them into tiny actionable blankies! 🌸🐰✨",
  "Pwease feed this smol idea basket your chaotic brain sprinkles, precious code bean, nyaaa~! 🧺🍓💖",
  "Your next genius scribble deserves a teeny strawberry throne right here, senpai, so plop it down with extra uwu! 🍓👑✨",
  "Hewwooo, esteemed keyboard warrior, leave a baby thought for the marshmallow planning fairies to kiss into a task! 🧚🍡💕",
  "This fluffy little TODO nest is awaiting your most fearsome engineering concerns with itsy-bitsy heart-shaped mittens, nya~! 🪺🧤💗",
  "Scribble a wishie-wish here and our turbo-kawaii backlog hamster will carry it to task town in a cupcake carriage! 🐹🧁🌈",
  "O mighty architect-chan, bestow a crumb of developer wisdom upon this sparkly pudding of possibility, pweeease! 🍮🎀🥺",
  "Deposit your spicy code grumbles here for complimentary kitten cuddles and eventual actionable sparklefication, uwu deluxe! 🐱🌶️💞",
  "Beep-boop, your emotional support idea dumpling requests one freshly squished thought and seven billion tiny headpats! 🥟🤖💖",
  "Nyaa~ this empty page has put on its fanciest bunny ears just to welcome your next catastrophically adorable dev idea! 🐰🎀🌟",
] as const);

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

export const debtFile = ".ai/debt.md" satisfies File;

export const budgetKinds = freeze([
  "goal",
  "context",
  "doneWhen",
  "comment",
  "backlogEntry",
  "debtEntry",
] as const);

export const budgetModes = freeze(["warn", "deny"] as const);

export const defaultBudgetMode = "warn" as const;

export const defaultBudgets = freeze({
  goal: 60,
  context: 80,
  doneWhen: 60,
  comment: 150,
  backlogEntry: 60,
  debtEntry: 60,
} as const);

export const subagentCacheTtls = freeze(["5m", "1h"] as const);

export const defaultSubagentCacheTtl = "1h" as const;

export const hookEvents = freeze([
  "PreToolUse",
  "PostToolUse",
  "SubagentStop",
] as const);

export const defaultInstructionFiles = freeze([
  "AGENTS.md",
  ".claude/rules/**/*.md",
  ".claude/skills/*/SKILL.md",
  ".claude/agents/*.md",
  ".agents/skills/*/SKILL.md",
] as const) satisfies Globs;
