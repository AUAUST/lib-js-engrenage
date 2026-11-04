import type { workflowSets } from "#tools/github/constants";

export type WorkflowSetName = keyof typeof workflowSets;
