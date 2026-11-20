import { freeze } from "@auaust/toolkit/object";

import type { IssueContract } from "#tools/github/issues/contract/types/IssueContract";
import type { IssueType } from "#tools/github/issues/contract/types/IssueType";
import type { NamedMeaning } from "#tools/github/issues/contract/types/NamedMeaning";

export const typeMeanings = freeze({
  plan: freeze({
    name: "Plan",
    intent: "Goal, design, decisions and roadmap of a tree of issues.",
  }),
  segment: freeze({
    name: "Segment",
    intent: "Organisational wrapper for items sharing a context, with no work of its own.",
  }),
  task: freeze({
    name: "Task",
    intent: "Positive work: something added or improved.",
  }),
  problem: freeze({
    name: "Problem",
    intent: "Negative work: something wrong, to fix.",
  }),
  resource: freeze({
    name: "Resource",
    intent: "Material kept for its content, never actionable.",
  }),
  idea: freeze({
    name: "Idea",
    intent: "Something to consider, not specified or accepted yet.",
  }),
} as const) satisfies Readonly<Record<string, NamedMeaning>>;

export const fieldMeanings = freeze({
  nature: freeze({
    name: "Nature",
    intent: "Kind of a task; unset means a generic task.",
  }),
  defect: freeze({
    name: "Defect",
    intent: "Kind of a problem; unset means a generic problem.",
  }),
  priority: freeze({
    name: "Priority",
    intent: "Order against normal work; unset means normal.",
  }),
  complexity: freeze({
    name: "Complexity",
    intent: "Effort an item takes; unset means normal.",
  }),
  material: freeze({
    name: "Material",
    intent: "Kind of a resource; unset means unclassified.",
  }),
  blockers: freeze({
    name: "Blockers",
    intent: "Reasons not to start an issue, several at once; unset means actionable.",
  }),
} as const) satisfies Readonly<Record<string, NamedMeaning>>;

export const optionMeanings = freeze({
  feature: freeze({
    field: "nature",
    name: "Feature",
    intent: "A capability that did not exist.",
  }),
  improvement: freeze({
    field: "nature",
    name: "Improvement",
    intent: "Existing behavior made better.",
  }),
  chore: freeze({
    field: "nature",
    name: "Chore",
    intent: "No product change: dependencies, CI, docs, cleanup.",
  }),
  bug: freeze({
    field: "defect",
    name: "Bug",
    intent: "Behavior is broken.",
  }),
  debt: freeze({
    field: "defect",
    name: "Debt",
    intent: "Works, but could be cleaner: names, comments, design.",
  }),
  performance: freeze({
    field: "defect",
    name: "Performance",
    intent: "Works, but too slow or too costly.",
  }),
  urgent: freeze({
    field: "priority",
    name: "Urgent",
    intent: "Before any other work.",
  }),
  highPriority: freeze({
    field: "priority",
    name: "High priority",
    intent: "Before normal work.",
  }),
  lowPriority: freeze({
    field: "priority",
    name: "Low priority",
    intent: "After normal work.",
  }),
  trivial: freeze({
    field: "complexity",
    name: "Trivial",
    intent: "Small and mechanical, with little context needed.",
  }),
  involved: freeze({
    field: "complexity",
    name: "Involved",
    intent: "Requires analysis and consideration, but remains reasonably contained.",
  }),
  complex: freeze({
    field: "complexity",
    name: "Complex",
    intent: "Substantial uncertainty, interacting constraints or dependencies.",
  }),
  reference: freeze({
    field: "material",
    name: "Reference",
    intent: "Outside material worth reading: sites, docs, threads.",
  }),
  specification: freeze({
    field: "material",
    name: "Specification",
    intent: "Our own normative content: contracts, protocols, formats; kept current.",
  }),
  report: freeze({
    field: "material",
    name: "Report",
    intent: "An analysis later work draws on: study, comparison, audit, recommendation.",
  }),
  archive: freeze({
    field: "material",
    name: "Archive",
    intent: "Snapshot kept for history; never updated.",
  }),
  questions: freeze({
    field: "blockers",
    name: "Open questions",
    intent: "Has **Planning** or **Questions**.",
  }),
  outdated: freeze({
    field: "blockers",
    name: "Outdated",
    intent: "Written against code or decisions that changed; refresh before use.",
  }),
  awaitingOthers: freeze({
    field: "blockers",
    name: "Awaiting others",
    intent: "Waits on a person or party outside the tracker.",
  }),
  delayed: freeze({
    field: "blockers",
    name: "Delayed",
    intent: "Postponed on purpose.",
  }),
  drafting: freeze({
    field: "blockers",
    name: "Drafting",
    intent: "Claimed by a session drafting it locally.",
  }),
} as const) satisfies Readonly<Record<string, NamedMeaning & { readonly field: keyof typeof fieldMeanings }>>;

export const closeReasonMeanings = freeze({
  completed: freeze({
    name: "completed",
    intent: "Done, usually by a pull request.",
  }),
  notPlanned: freeze({
    name: "not planned",
    intent: "Not done: rejected, obsolete or irrelevant.",
  }),
  duplicate: freeze({
    name: "duplicate",
    intent: "Duplicate of another issue, linked as its duplicate-of.",
  }),
} as const) satisfies Readonly<Record<string, NamedMeaning>>;

export const debuggerBlockingOptions = freeze([
  "awaitingOthers",
  "delayed",
  "drafting",
  "outdated",
] as const) satisfies readonly (keyof typeof optionMeanings)[];

export const planningSection = "Planning";

export const questionsSection = "Questions";

export const stepsSection = "Steps";

export const housekeepingSection = "Housekeeping";

export const roadmapSection = "Roadmap";

export const checkpointPrefix = "Checkpoint:";

export const segmentForbiddenSections = freeze([
  "Steps",
  "Tests",
  "Scope",
  "Decisions",
] as const);

export const issueContracts = freeze({
  task: freeze({
    sections: freeze([
      "Context",
      "Prerequisites",
      "Steps",
      "Housekeeping",
      "Tests",
      "Done when",
      "Planning",
      "Questions",
    ] as const),
    required: freeze(["Context"] as const),
    requiredAny: freeze([freeze(["Steps", "Housekeeping"] as const)] as const),
    requiredWith: freeze({ Steps: freeze(["Tests"] as const) } as const),
    exclusive: freeze([
      freeze(["Steps", "Housekeeping"] as const),
      freeze(["Housekeeping", "Tests"] as const),
    ] as const),
    withSubIssues: freeze(["Housekeeping"] as const),
    hints: freeze({
      Steps: "Steps for the work a worker implements: keep Steps or Housekeeping and delete the other.",
      Housekeeping: "Housekeeping on a parent whose own work is only commands, checks or record edits, applied without a worker once its sub-issues land. Keep Steps or Housekeeping and delete the other.",
    } as const),
    hasHeader: true,
    subIssues: "references",
  } as const),
  problem: freeze({
    sections: freeze([
      "Context",
      "Prerequisites",
      "Steps",
      "Leads",
      "Housekeeping",
      "Tests",
      "Done when",
      "Planning",
      "Questions",
    ] as const),
    required: freeze(["Context"] as const),
    requiredWith: freeze({ Steps: freeze(["Tests"] as const) } as const),
    exclusive: freeze([
      freeze(["Steps", "Leads", "Housekeeping"] as const),
      freeze(["Housekeeping", "Tests"] as const),
    ] as const),
    withSubIssues: freeze(["Housekeeping"] as const),
    hints: freeze({
      Steps: "Steps when the cause is clear and only the fix remains, for a worker: keep one of Steps, Leads or Housekeeping and delete the others.",
      Leads: "Leads when the cause still needs investigation, for a debugger: facts, symptoms, reproductions and suspected sites. Keep one of Steps, Leads or Housekeeping and delete the others.",
      Housekeeping: "Housekeeping on a parent whose sub-issues hold the fix and whose own work is only commands, checks or record edits, applied without an agent once they land. Keep one of Steps, Leads or Housekeeping and delete the others.",
    } as const),
    hasHeader: true,
    subIssues: "references",
  } as const),
  segment: freeze({
    sections: freeze([
      "Context",
      "Prerequisites",
      "Done when",
      "Planning",
      "Questions",
    ] as const),
    required: freeze([] as const),
    hasHeader: true,
    subIssues: "references",
  } as const),
  plan: freeze({
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
    generated: freeze([roadmapSection] as const),
    subIssues: "roadmap",
  } as const),
} as const) satisfies Partial<Record<IssueType, IssueContract>>;

export const chainSeparator = " › ";

export const partSeparator = " · ";

export const qualifiedReferenceSource = String.raw`(?:([\w.-]+\/[\w.-]+))?#(\d+)`;
