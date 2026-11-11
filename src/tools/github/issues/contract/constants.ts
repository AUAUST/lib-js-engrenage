import { freeze } from "@auaust/toolkit/object";

import type { IssueContract } from "#tools/github/issues/contract/types/IssueContract";
import type { IssueType } from "#tools/github/issues/contract/types/IssueType";

export const issueTypes = freeze([
  "Plan",
  "Segment",
  "Task",
  "Problem",
  "Resource",
  "Idea",
] as const);

export const blockersField = "Blockers";

export const openQuestionsOption = "Open questions";

export const debuggerBlockingOptions = freeze([
  "Awaiting others",
  "Delayed",
  "Drafting",
  "Outdated",
] as const);

export const planningSection = "Planning";

export const questionsSection = "Questions";

export const stepsSection = "Steps";

export const roadmapSection = "Roadmap";

export const checkpointPrefix = "Checkpoint:";

export const segmentForbiddenSections = freeze([
  "Steps",
  "Tests",
  "Scope",
  "Decisions",
] as const);

const itemContract = freeze({
  sections: freeze([
    "Context",
    "Prerequisites",
    "Steps",
    "Tests",
    "Done when",
    "Planning",
    "Questions",
  ] as const),
  required: freeze(["Context", "Steps", "Tests"] as const),
  hasHeader: true,
} as const) satisfies IssueContract;

// @debt the protocol's GitHub names are constants until #214 maps them through config
export const issueContracts = freeze({
  Task: itemContract,
  Problem: itemContract,
  Segment: freeze({
    sections: freeze([
      "Context",
      "Prerequisites",
      "Done when",
      "Planning",
      "Questions",
    ] as const),
    required: freeze([] as const),
    hasHeader: true,
  } as const),
  Plan: freeze({
    sections: freeze([
      "Goal",
      "Roadmap",
      "Decisions",
      "Done when",
      "Planning",
      "Questions",
    ] as const),
    required: freeze(["Goal", "Roadmap", "Decisions"] as const),
    modelsAfter: "Roadmap",
    hasHeader: false,
  } as const),
} as const) satisfies Partial<Record<IssueType, IssueContract>>;
