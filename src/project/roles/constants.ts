import { array, looseObject, optional, picklist, string } from "valibot";
import type { StandardSchemaV1 } from "@standard-schema/spec";

import { freeze } from "@auaust/toolkit/object";

import { engrenage } from "#constants";
import { traits } from "#project/presets/constants";

// @debt structure finds the index and entry roles by these names, while a preset's `name` option lets a project rename them
export const rolePresetsEntry = `${engrenage}/roles`;

export const indexRoleName = "index";

export const entryRoleName = "entrypoint";

export const executableRoleName = "executable";

export const roleContractDefaults = freeze({
  nesting: 0,
  index: false,
  public: false,
  typeOnly: false,
  discovered: false,
  scoped: false,
  strict: false,
  unique: false,
  required: false,
} as const);

// @debt typed as StandardSchemaV1 to pass auaust/readonly-constants, erasing the validator's output type
export const rolePresetEntry: StandardSchemaV1 = looseObject({
  name: string(),
  from: string(),
  environments: array(string()),
  traits: optional(array(picklist(traits))),
});
