import type { workflowSets } from "#tools/github/constants";

/**
 * Name of a workflow set `github.workflows` accepts.
 */
export type WorkflowSetName = keyof typeof workflowSets;
