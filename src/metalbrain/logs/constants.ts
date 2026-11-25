import { freeze } from "@auaust/toolkit/object";

import type { RecordKind } from "#metalbrain/records/index";
import type { Globs } from "#types/Globs";

const subject = freeze({
  type: "text",
  description: "what the entry is about, in a few words",
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
  title: "subject",
  groupBy: "subject",
  search: freeze({
    weights: freeze({
      id: 4,
      subject: 3,
      stopped: 1.5,
      tried: 1,
    }),
  }),
  taps: true,
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
  title: "subject",
  groupBy: "subject",
  search: freeze({
    weights: freeze({
      id: 4,
      subject: 3,
      need: 1.5,
      reason: 1,
    }),
  }),
  taps: true,
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
  title: "subject",
  groupBy: "subject",
  search: freeze({
    weights: freeze({
      id: 4,
      subject: 3,
      what: 1.5,
      why: 1,
    }),
  }),
} as const) satisfies RecordKind;

export const missing = freeze({
  name: "missing",
  namespace: "MI",
  location: freeze({ file: ".ai/missing.yml" }),
  fields: freeze({
    subject: freeze({
      type: "text",
      description: "the capability missed, in a few words",
    }),
    need: freeze({ type: "text", description: "what the work needed it for" }),
    instead: freeze({
      type: "text",
      description: "what was built or done instead, with its site",
    }),
  }),
  detailLimit: 0,
  wordCap: "logEntry",
  title: "subject",
  groupBy: "subject",
  search: freeze({
    weights: freeze({
      id: 4,
      subject: 3,
      need: 1.5,
      instead: 1,
    }),
  }),
  taps: true,
} as const) satisfies RecordKind;

export const logKinds = freeze([
  friction,
  discarded,
  pending,
  missing,
] as const);

export const legacyLogs = freeze([
  freeze({ kind: friction, file: ".ai/friction.md" }),
  freeze({ kind: discarded, file: ".ai/discarded.md" }),
] as const);

export const agentLogFiles = freeze(
  legacyLogs.map(({ file }) => file),
) satisfies Globs;
