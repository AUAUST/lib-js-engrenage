import {
  array,
  function_,
  looseObject,
  optional,
  picklist,
  string,
} from "valibot";
import type { StandardSchemaV1 } from "@standard-schema/spec";

import { traits } from "#project/presets/constants";

// @debt typed as StandardSchemaV1 to pass auaust/readonly-constants, erasing the validator's output type
export const rolePresetEntry: StandardSchemaV1 = looseObject({
  name: string(),
  load: function_(),
  environments: array(string()),
  traits: optional(array(picklist(traits))),
  languages: optional(array(string())),
});
