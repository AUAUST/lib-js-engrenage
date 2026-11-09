import {
  array,
  function_,
  looseObject,
  optional,
  record,
  string,
} from "valibot";
import type { StandardSchemaV1 } from "@standard-schema/spec";

// @debt typed as StandardSchemaV1 to pass auaust/readonly-constants, erasing the validator's output type
export const syncTargetEntry: StandardSchemaV1 = looseObject({
  name: string(),
  stage: string(),
  flags: optional(record(string(), string())),
  reads: optional(array(string())),
  produces: optional(array(string())),
  load: function_(),
});

// @debt typed as StandardSchemaV1 to pass auaust/readonly-constants, erasing the validator's output type
export const syncDoneEntry: StandardSchemaV1 = looseObject({
  name: optional(string()),
  load: function_(),
});
