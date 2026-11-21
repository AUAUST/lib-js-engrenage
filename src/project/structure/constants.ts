import { function_, looseObject, string } from "valibot";
import type { StandardSchemaV1 } from "@standard-schema/spec";

export const projectMapRule = "project-map";

// @debt typed as StandardSchemaV1 to pass auaust/readonly-constants, erasing the validator's output type
export const layoutEntry: StandardSchemaV1 = looseObject({
  name: string(),
  load: function_(),
});
