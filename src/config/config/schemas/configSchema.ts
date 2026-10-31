import {
  boolean,
  literal,
  optional,
  picklist,
  strictObject,
  union,
} from "valibot";

import { preferredSchema } from "#agents/config/schemas/preferredSchema";
import { defineSchema } from "#config/config/schemas/defineSchema";
import { directorySchema } from "#config/config/schemas/directorySchema";
import { environmentSchema } from "#config/config/schemas/environmentSchema";
import { fileSchema } from "#config/config/schemas/fileSchema";
import { globSchema, globsSchema } from "#config/config/schemas/globsSchema";
import { listOptionSchema } from "#config/config/schemas/listOptionSchema";
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
  };
}

export const configSchema = strictObject({
  presets: optional(presetsSchema),
  define: optional(defineSchema),
  src: optional(environmentSchema(createCodeEnvironment())),
  tests: optional(
    environmentSchema({
      ...createCodeEnvironment(),
      files: optional(globListSchema),
      fixtures: optional(globListSchema),
      coverageDir: optional(directorySchema),
    }),
  ),
  bin: optional(environmentSchema(createCodeEnvironment())),
  scripts: optional(environmentSchema(createCodeEnvironment())),
  tooling: optional(
    environmentSchema({
      dirs: optional(dirsSchema),
      files: optional(globListSchema),
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
      tsconfig: optional(fileSchema),
      distTsconfig: optional(fileSchema),
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
