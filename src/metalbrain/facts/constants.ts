import { freeze } from "@auaust/toolkit/object";

export const wordCapKinds = freeze([
  "compass",
  "context",
  "doneWhen",
  "comment",
  "backlogEntry",
  "logEntry",
] as const);

export const wordCapModes = freeze(["warn", "deny"] as const);

export const defaultWordCapMode = "warn" as const;

export const defaultWordCaps = freeze({
  compass: 110,
  context: 120,
  doneWhen: 110,
  comment: 150,
  backlogEntry: 100,
  logEntry: 60,
} as const);

export const defaultOutputLimit = 10_000;
