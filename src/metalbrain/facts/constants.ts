import { freeze } from "@auaust/toolkit/object";

export const wordCapKinds = freeze([
  "goal",
  "context",
  "doneWhen",
  "comment",
  "backlogEntry",
  "logEntry",
] as const);

export const wordCapModes = freeze(["warn", "deny"] as const);

export const defaultWordCapMode = "warn" as const;

export const defaultWordCaps = freeze({
  goal: 150,
  context: 150,
  doneWhen: 150,
  comment: 150,
  backlogEntry: 100,
  logEntry: 60,
} as const);

export const defaultOutputLimit = 10_000;
