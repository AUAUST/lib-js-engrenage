import {
  array,
  function_,
  looseObject,
  optional,
  picklist,
  string,
} from "valibot";
import type { StandardSchemaV1 } from "@standard-schema/spec";

import { freeze } from "@auaust/toolkit/object";

export const traits = freeze(["published"] as const);

// @debt typed as StandardSchemaV1 to pass auaust/readonly-constants, erasing the validator's output type
export const presetEntry: StandardSchemaV1 = looseObject({
  name: string(),
  traits: array(picklist(traits)),
  load: optional(function_()),
});
