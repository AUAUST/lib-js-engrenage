import {
  array,
  boolean,
  looseObject,
  optional,
  record,
  string,
  unknown,
} from "valibot";
import type { StandardSchemaV1 } from "@standard-schema/spec";

import { stateDirectory } from "#project/config/constants";
import type { File } from "#types/File";

export const emittedManifestFile = "emitted.json";

export const buildSourcesFile = `${stateDirectory}/build-sources.json` satisfies File;

export const defaultBuildClean = "all" as const;

export const defaultSourcemap = true;

// @debt typed as StandardSchemaV1 to pass auaust/readonly-constants, erasing the validator's output type
export const buildToolEntry: StandardSchemaV1 = looseObject({
  name: string(),
  package: string(),
  outDir: optional(string()),
  bundled: optional(boolean()),
  types: optional(array(string())),
  // @debt `globals` and `imports` are checked only as records here, since constants cannot load the effects schemas; their ranks reach lint unvalidated
  globals: optional(record(string(), unknown())),
  imports: optional(record(string(), unknown())),
});
