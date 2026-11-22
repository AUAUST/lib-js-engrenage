import { freeze } from "@auaust/toolkit/object";

import type { Globs } from "#types/Globs";

export const recordFileExtension = ".yml";

export const recordIndexName = "index";

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

export const agentLogFiles = freeze([
  ".ai/friction.md",
  ".ai/discarded.md",
] as const) satisfies Globs;
