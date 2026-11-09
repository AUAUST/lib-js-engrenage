import { function_, looseObject, picklist, string } from "valibot";
import type { StandardSchemaV1 } from "@standard-schema/spec";

import type { PackageName } from "#types/PackageName";

export const gateCache = "gate" satisfies PackageName;

// @debt typed as StandardSchemaV1 to pass auaust/readonly-constants, erasing the validator's output type
export const gateStepEntry: StandardSchemaV1 = looseObject({
  name: string(),
  stage: string(),
  audience: picklist(["everyone", "agents"]),
  load: function_(),
});
