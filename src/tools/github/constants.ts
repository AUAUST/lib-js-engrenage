import { freeze, keys } from "@auaust/toolkit/object";

import { changesetsCli, engrenage } from "#constants";
import type { WorkflowSet } from "#github/types/WorkflowSet";
import type { Directory } from "#types/Directory";

export const workflowsDirectory = ".github/workflows" satisfies Directory;

export const workflowTemplates = `${engrenage}/github/workflows`;

export const libraryWorkflows = freeze({
  files: freeze(["ci.yml", "publish.yml"] as const),
  requires: freeze([changesetsCli] as const),
  scripts: freeze(["ci:check", "ci:test", "ci:build", "ci:publish"] as const),
} as const) satisfies WorkflowSet;

export const workflowSets = freeze({
  library: libraryWorkflows,
} as const) satisfies Record<string, WorkflowSet>;

export const workflowSetNames = freeze(keys(workflowSets));
