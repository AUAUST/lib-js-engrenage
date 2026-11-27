import { array, function_, looseObject, optional, string } from "valibot";
import type { StandardSchemaV1 } from "@standard-schema/spec";

// @debt typed as StandardSchemaV1 to pass auaust/readonly-constants, erasing the validator's output type
export const commandContribution: StandardSchemaV1 = looseObject({
  name: string(),
  aliases: optional(array(string())),
  load: function_(),
});
