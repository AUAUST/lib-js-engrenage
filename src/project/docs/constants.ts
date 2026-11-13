import { function_, looseObject, string } from "valibot";
import type { StandardSchemaV1 } from "@standard-schema/spec";

// @debt typed as StandardSchemaV1 to pass auaust/readonly-constants, erasing the validator's output type
export const tagSetEntry: StandardSchemaV1 = looseObject({
  name: string(),
  load: function_(),
});
