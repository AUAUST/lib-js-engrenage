import { freeze } from "@auaust/toolkit/object";

import type { IssueContract } from "#tools/github/issues/contract/types/IssueContract";
import type { IssueType } from "#tools/github/issues/contract/types/IssueType";
import type { NamedMeaning } from "#tools/github/issues/contract/types/NamedMeaning";

export const typeMeanings = freeze({
  plan: freeze({
    name: "Plan",
    intent: "Compass, design, decisions and roadmap of a tree of issues.",
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

export const housekeepingSection = "Housekeeping";

export const roadmapSection = "Roadmap";

export const resplitSection = "Re-split log";

export const stepsSection = "Steps";

export const checkpointPrefix = "Checkpoint:";

export const pendingPlanningSections = freeze([
  "Fix",
  housekeepingSection,
  "Done when",
] as const);

const housekeepingHint = "Housekeeping only on a parent whose own work, once its sub-issues land, is commands, checks or record edits applied without an agent; delete it otherwise.";

const leafHousekeeping = "**Housekeeping** applies once the sub-issues land, and this issue has none: create them, or state the outcome under **Done when**.";

const housekeepingTests = "A parent whose own work is only **Housekeeping** has no **Tests**: write them in the sub-issue that owns them.";

const problemParentForbidden = freeze({
  Leads: "**Leads** on a parent belong to the sub-issue investigating them: move them there.",
  Fix: "**Fix** on a parent belongs to the sub-issue applying it: move it there.",
});

function createParentShapes(forbidden: Readonly<Record<string, string>> = {}) {
  return [
    freeze({
      summary: "with sub-issues and **Housekeeping**",
      audience: "orchestrator",
      when: freeze({ subIssues: true, section: housekeepingSection }),
      required: freeze(["Context", "Done when"] as const),
      forbidden: freeze({ ...forbidden, Tests: housekeepingTests }),
    } as const),
    freeze({
      summary: "with sub-issues",
      audience: "worker",
      when: freeze({ subIssues: true }),
      required: freeze(["Context", "Done when"] as const),
      forbidden,
    } as const),
  ] as const;
}

export const issueContracts = freeze({
  task: freeze({
    sections: freeze([
      "Context",
      "Prerequisites",
      "Provides",
      housekeepingSection,
      "Done when",
      "Tests",
      planningSection,
      questionsSection,
    ] as const),
    shapes: freeze([
      ...createParentShapes(),
      freeze({
        summary: "without sub-issues",
        audience: "worker",
        required: freeze(["Context", "Done when"] as const),
        forbidden: freeze({ [housekeepingSection]: leafHousekeeping }),
      }),
    ] as const),
    hints: freeze({
      Provides: "Provides only for what a plan's Model contracts or a user-facing surface expect from this issue; delete it otherwise.",
      [housekeepingSection]: housekeepingHint,
    } as const),
    hasHeader: true,
    subIssues: "references",
  } as const),
  problem: freeze({
    sections: freeze([
      "Context",
      "Prerequisites",
      "Leads",
      "Fix",
      housekeepingSection,
      "Done when",
      "Tests",
      planningSection,
      questionsSection,
    ] as const),
    shapes: freeze([
      ...createParentShapes(problemParentForbidden),
      freeze({
        summary: "with **Fix**",
        audience: "worker",
        when: freeze({ section: "Fix" }),
        required: freeze(["Context", "Done when"] as const),
        forbidden: freeze({
          Leads: "**Fix** settles the direction **Leads** would investigate: delete **Leads**, or delete **Fix** to send the issue to a debugger.",
          [housekeepingSection]: leafHousekeeping,
        }),
      }),
      freeze({
        summary: "without **Fix**",
        audience: "debugger",
        required: freeze(["Context"] as const),
        draftRequired: freeze(["Done when"] as const),
        forbidden: freeze({ [housekeepingSection]: leafHousekeeping }),
      }),
    ] as const),
    hints: freeze({
      Leads: "Leads only when genuine directions to investigate exist, for a debugger: symptoms, reproductions, suspected sites. Keep at most one of Leads and Fix.",
      Fix: "Fix exactly when the cause is identified and its fix decided: that fix, for a worker. Keep at most one of Leads and Fix.",
      [housekeepingSection]: housekeepingHint,
    } as const),
    hasHeader: true,
    subIssues: "references",
  } as const),
  segment: freeze({
    sections: freeze([
      "Context",
      "Prerequisites",
      "Done when",
      planningSection,
      questionsSection,
    ] as const),
    shapes: freeze([
      freeze({
        summary: "grouping sub-issues",
        audience: "verification",
        required: freeze(["Done when"] as const),
        forbidden: freeze({
          Provides: "A segment provides nothing of its own: write **Provides** in the sub-issue that owns it.",
          Tests: "A segment has no **Tests**: write them in the sub-issue that owns them.",
          Decisions: "A segment has no **Decisions**: write them in the plan, or the sub-issue that owns them.",
        }),
      }),
    ] as const),
    hasHeader: true,
    subIssues: "references",
  } as const),
  plan: freeze({
    sections: freeze([
      "Compass",
      roadmapSection,
      "Decisions",
      resplitSection,
      "Done when",
      planningSection,
      questionsSection,
    ] as const),
    shapes: freeze([
      freeze({
        summary: "with a **Roadmap**",
        audience: "verification",
        required: freeze([
          "Compass",
          roadmapSection,
          "Decisions",
          "Done when",
        ] as const),
        forbidden: freeze({
          Goal: "**Goal** is now **Compass**: rename the section.",
        }),
      }),
    ] as const),
    modelsAfter: roadmapSection,
    hasHeader: false,
    generated: freeze({
      [roadmapSection]: "`subIssues`",
      [resplitSection]: "the `resplit:` reasons of its tree's drafts",
    }),
    subIssues: "roadmap",
  } as const),
} as const) satisfies Partial<Record<IssueType, IssueContract>>;

export const chainSeparator = " › ";

export const partSeparator = " · ";

export const qualifiedReferenceSource = String.raw`(?:([\w.-]+\/[\w.-]+))?#(\d+)`;
