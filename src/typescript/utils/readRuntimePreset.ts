import { join } from "node:path";

import { array, object, string } from "valibot";

import { readJsonFile } from "#support/filesystem/utils/readJsonFile";
import { resolveTsconfigPresets } from "#typescript/utils/resolveTsconfigPresets";
import { validate } from "#utils/validate";
import type { Runtime } from "#config/types/Runtime";

const runtimePresetSchema = object({
  compilerOptions: object({
    target: string(),
    lib: array(string()),
  }),
});

export function readRuntimePreset(runtime: Runtime) {
  const file =
    runtime.kind === "baseline"
      ? join("baseline", `${runtime.snapshot}.json`)
      : join("node", `${runtime.major}.json`);

  const path = join(resolveTsconfigPresets(), file);

  return validate(runtimePresetSchema, readJsonFile(path), path)
    .compilerOptions;
}
