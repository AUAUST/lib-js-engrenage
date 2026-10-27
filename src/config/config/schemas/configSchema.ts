import {
  boolean,
  literal,
  optional,
  picklist,
  strictObject,
  union,
} from "valibot";

import { defineSchema } from "#config/config/schemas/defineSchema";
import {
  directoriesSchema,
  directorySchema,
} from "#config/config/schemas/directorySchema";
import { fileSchema } from "#config/config/schemas/fileSchema";
import { globsSchema } from "#config/config/schemas/globsSchema";
import { presetsSchema } from "#config/config/schemas/presetsSchema";
import { workflowSetNames } from "#github/constants";

function createDirectoriesGroup() {
  return optional(
    strictObject({
      dirs: optional(directoriesSchema),
    }),
  );
}

export const configSchema = strictObject({
  presets: optional(presetsSchema),
  define: optional(defineSchema),
  code: optional(
    strictObject({
      files: optional(globsSchema),
      configFiles: optional(globsSchema),
      discoveredFiles: optional(globsSchema),
      generatedFiles: optional(globsSchema),
    }),
  ),
  source: createDirectoriesGroup(),
  bin: createDirectoriesGroup(),
  scripts: createDirectoriesGroup(),
  test: optional(
    strictObject({
      dirs: optional(directoriesSchema),
      files: optional(globsSchema),
      fixtureFiles: optional(globsSchema),
      coverageDir: optional(directorySchema),
    }),
  ),
  build: optional(
    strictObject({
      outDir: optional(directorySchema),
      emptyOutDir: optional(boolean()),
    }),
  ),
  typescript: optional(
    strictObject({
      tsconfig: optional(fileSchema),
      distTsconfig: optional(fileSchema),
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
      instructionFiles: optional(globsSchema),
      snippetsDir: optional(directorySchema),
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
