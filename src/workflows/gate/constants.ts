import { function_, looseObject, optional, picklist, string } from "valibot";
import type { StandardSchemaV1 } from "@standard-schema/spec";

import { freeze } from "@auaust/toolkit/object";

import type { PackageName } from "#types/PackageName";

export const gateCache = "gate" satisfies PackageName;

export const gateBookkeepingGroups = freeze({
  stamp: "stamp",
  tree: "tree",
} as const);

// @debt typed as StandardSchemaV1 to pass auaust/readonly-constants, erasing the validator's output type
export const gateStepEntry: StandardSchemaV1 = looseObject({
  name: string(),
  stage: string(),
  audience: picklist(["everyone", "agents"]),
  load: function_(),
  check: optional(looseObject({ load: function_() })),
});

// @debt a commit subject makes a text query of two or three leaves, whose similarities run higher than a whole entry's, so commit hints keep their own threshold instead of a similarity normalized by query length
export const commitSimilarityThreshold = 0.4;
