import {
  boolean,
  literal,
  optional,
  picklist,
  record,
  strictObject,
  string,
  union,
} from "valibot";

import { preferredSchema } from "#agents/config/schemas/preferredSchema";
import { baseTsconfigSchema } from "#config/config/schemas/baseTsconfigSchema";
import { defineSchema } from "#config/config/schemas/defineSchema";
import { directorySchema } from "#config/config/schemas/directorySchema";
import { environmentSchema } from "#config/config/schemas/environmentSchema";
import { environmentTsconfigSchema } from "#config/config/schemas/environmentTsconfigSchema";
import { exposedFilesSchema } from "#config/config/schemas/exposedFilesSchema";
import { fileSchema } from "#config/config/schemas/fileSchema";
import { globSchema, globsSchema } from "#config/config/schemas/globsSchema";
import { listOptionSchema } from "#config/config/schemas/listOptionSchema";
import { nodeMajorSchema } from "#config/config/schemas/nodeMajorSchema";
import { presetsSchema } from "#config/config/schemas/presetsSchema";
import { workflowSetNames } from "#github/constants";

const dirsSchema = listOptionSchema(directorySchema);

const globListSchema = listOptionSchema(globSchema);

function createCodeEnvironment() {
  return {
    dirs: optional(dirsSchema),
    generated: optional(globListSchema),
    discovered: optional(globListSchema),
    defines: optional(boolean()),
    tsconfig: optional(environmentTsconfigSchema),
  };
}

export const configSchema = strictObject({
  presets: optional(presetsSchema),
  runtime: optional(
    strictObject({
      node: optional(nodeMajorSchema),
    }),
  ),
  define: optional(defineSchema),
  src: optional(
    environmentSchema({
      ...createCodeEnvironment(),
      exports: optional(exposedFilesSchema),
      baseline: optional(string()),
      node: optional(nodeMajorSchema),
    }),
  ),
  tests: optional(
    environmentSchema({
      ...createCodeEnvironment(),
      files: optional(globListSchema),
      fixtures: optional(globListSchema),
      coverageDir: optional(directorySchema),
      dist: optional(
        strictObject({
          tsconfig: optional(environmentTsconfigSchema),
        }),
      ),
    }),
  ),
  bin: optional(
    environmentSchema({
      ...createCodeEnvironment(),
      commands: optional(record(string(), fileSchema)),
      node: optional(nodeMajorSchema),
    }),
  ),
  data: optional(
    environmentSchema({
      exports: optional(exposedFilesSchema),
    }),
  ),
  scripts: optional(environmentSchema(createCodeEnvironment())),
  tooling: optional(
    environmentSchema({
      dirs: optional(dirsSchema),
      files: optional(globListSchema),
      tsconfig: optional(environmentTsconfigSchema),
    }),
  ),
  build: optional(
    strictObject({
      outDir: optional(directorySchema),
      emptyOutDir: optional(boolean()),
      sourcemap: optional(boolean()),
      typed: optional(boolean()),
    }),
  ),
  cache: optional(
    strictObject({
      dir: optional(directorySchema),
    }),
  ),
  typescript: optional(
    strictObject({
      tsconfig: optional(baseTsconfigSchema),
      files: optional(globListSchema),
      envFile: optional(fileSchema),
    }),
  ),
  git: optional(
    strictObject({
      gitignore: optional(fileSchema),
    }),
  ),
  prettier: optional(
    strictObject({
      prettierignore: optional(fileSchema),
    }),
  ),
  agents: optional(
    strictObject({
      preferred: optional(preferredSchema),
      instructionFiles: optional(globsSchema),
      snippetsDir: optional(directorySchema),
      claudeSettings: optional(boolean()),
      codexHooks: optional(boolean()),
    }),
  ),
  github: optional(
    strictObject({
      workflows: optional(union([literal(false), picklist(workflowSetNames)])),
    }),
  ),
  vscode: optional(
    strictObject({
      settings: optional(boolean()),
      extensions: optional(boolean()),
    }),
  ),
});
