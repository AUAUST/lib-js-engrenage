import {
  array,
  function_,
  looseObject,
  optional,
  picklist,
  record,
  string,
} from "valibot";
import type { StandardSchemaV1 } from "@standard-schema/spec";

import { stateDirectory } from "#project/config/constants";
import type { File } from "#types/File";

export const syncRecordFile = `${stateDirectory}/sync.json` satisfies File;

export const syncStages = ["generate", "write", "fill", "check"] as const;

// @debt typed as StandardSchemaV1 to pass auaust/readonly-constants, erasing the validator's output type
export const syncTargetEntry: StandardSchemaV1 = looseObject({
  name: string(),
  stage: picklist(syncStages),
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

// @debt typed as StandardSchemaV1 to pass auaust/readonly-constants, erasing the validator's output type
export const blockSyntaxEntry: StandardSchemaV1 = looseObject({
  name: string(),
  files: array(string()),
  open: string(),
  close: string(),
  padding: string(),
});
