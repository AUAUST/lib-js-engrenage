import { freeze } from "@auaust/toolkit/object";

import { engrenage } from "#constants";
import { claudeShellVariable } from "#tools/agents/claude/constants";
import type { ImportCategory, ImportRelation } from "#project/structure/index";
import type { Agent } from "#tools/agents/types/Agent";
import type { BlockSyntax } from "#types/BlockSyntax";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";

export const markdownBlocks = freeze({
  open: "<!-- ",
  close: " -->",
  padding: "\n\n",
} as const) satisfies BlockSyntax;

export const agentsFile = "AGENTS.md" satisfies File;

export const agentsTemplate = `${engrenage}/agents/templates/${agentsFile}`;

export const agentNames = freeze(["claude", "codex"] as const);

export const agentShellVariables = freeze({
  claude: claudeShellVariable,
} as const) satisfies Partial<Record<Agent, string>>;

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

export const projectMapFile = ".claude/rules/project-map.md" satisfies File;

export const projectMapDirectory = ".claude/rules/project-map" satisfies File;

export const projectMapCategories = freeze([
  "public-entries",
  "internal-aliases",
  "bin",
  "scripts",
  "data",
  "tests",
] as const satisfies readonly ImportCategory[]);

export const projectMapRelations = freeze({
  "own-roles": "its own roles and files",
  "global-roles": "the global roles of the environment root",
  "ancestor-roles": "the roles of its ancestor domains, as a sub-domain",
  "sub-domain": "the `index.ts` and public roles of its sub-domains",
  "lower-layer": "the `index.ts` of domains in lower layers",
  "peer":
    "the `index.ts` of its peers (same layer, unless the namespace is isolated)",
  "environment": "another environment, as the matrix states",
  "test-variant": "as the test file table states",
  "root-entry": "any public surface, from the environment root file",
  "workspace": "another workspace, only through a declared dependency",
} as const satisfies Record<ImportRelation, string>);

export const debtFile = ".ai/debt.md" satisfies File;

export const issueDraftsDirectory = ".ai/issues/";

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
