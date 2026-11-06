import { freeze, keys } from "@auaust/toolkit/object";

import { changesetsCli, engrenage } from "#constants";
import type { IssueContract } from "#tools/github/types/IssueContract";
import type { IssueType } from "#tools/github/types/IssueType";
import type { WorkflowSet } from "#tools/github/types/WorkflowSet";
import type { Directory } from "#types/Directory";

export const workflowsDirectory = ".github/workflows" satisfies Directory;

export const workflowTemplates = `${engrenage}/github/workflows`;

export const libraryWorkflows = freeze({
  trait: "published",
  files: freeze(["ci.yml", "publish.yml"] as const),
  requires: freeze([changesetsCli] as const),
  scripts: freeze(["ci:check", "ci:test", "ci:build", "ci:publish"] as const),
} as const) satisfies WorkflowSet;

export const workflowSets = freeze({
  library: libraryWorkflows,
} as const) satisfies Record<string, WorkflowSet>;

export const workflowSetNames = freeze(keys(workflowSets));

export const githubApiUrl = "https://api.github.com";

export const githubApiVersion = "2022-11-28";

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
