import { looseObject, string } from "valibot";
import type { StandardSchemaV1 } from "@standard-schema/spec";

export const emittedManifestFile = "emitted.json";

export const defaultBuildClean = "all" as const;

export const defaultSourcemap = true;

// @debt typed as StandardSchemaV1 to pass auaust/readonly-constants, erasing the validator's output type
export const buildToolEntry: StandardSchemaV1 = looseObject({
  name: string(),
  package: string(),
});
