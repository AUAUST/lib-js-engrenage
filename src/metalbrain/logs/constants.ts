import { freeze } from "@auaust/toolkit/object";

import type { RecordKind } from "#metalbrain/records/index";
import type { Globs } from "#types/Globs";

const subject = freeze({
  type: "text",
  description: "what the entry is about, in a few words, so mentions of one subject match",
} as const);

export const friction = freeze({
  name: "friction",
  namespace: "FR",
  location: freeze({ file: ".ai/friction.yml" }),
  fields: freeze({
    subject,
    tried: freeze({ type: "text", description: "what you tried" }),
    stopped: freeze({
      type: "text",
      description: "what stopped it and how you got past",
    }),
  }),
  detailLimit: 0,
  wordCap: "logEntry",
  groupBy: "subject",
} as const) satisfies RecordKind;

export const discarded = freeze({
  name: "discarded",
  namespace: "DS",
  location: freeze({ file: ".ai/discarded.yml" }),
  fields: freeze({
    subject,
    need: freeze({ type: "text", description: "the need it would meet" }),
    reason: freeze({ type: "text", description: "why it was set aside" }),
  }),
  detailLimit: 0,
  wordCap: "logEntry",
  groupBy: "subject",
} as const) satisfies RecordKind;

export const pending = freeze({
  name: "pending",
  namespace: "PD",
  location: freeze({ file: ".ai/pending.yml" }),
  fields: freeze({
    subject,
    what: freeze({ type: "text", description: "the work left" }),
    why: freeze({ type: "text", description: "why it was left" }),
  }),
  detailLimit: 0,
  wordCap: "logEntry",
  groupBy: "subject",
} as const) satisfies RecordKind;

export const logKinds = freeze([friction, discarded, pending] as const);

export const legacyLogs = freeze([
  freeze({ kind: friction, file: ".ai/friction.md" }),
  freeze({ kind: discarded, file: ".ai/discarded.md" }),
] as const);

export const agentLogFiles = freeze(
  legacyLogs.map(({ file }) => file),
) satisfies Globs;
