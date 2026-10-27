import {
  array,
  boolean,
  literal,
  optional,
  picklist,
  strictObject,
  union,
  type GenericSchema,
} from "valibot";

import { directorySchema } from "#config/config/schemas/directorySchema";
import { fileSchema } from "#config/config/schemas/fileSchema";
import { globSchema } from "#config/config/schemas/globSchema";
import { presetSchema } from "#config/config/schemas/presetSchema";
import { workflowSetNames } from "#github/constants";
import type { Presets } from "#config/types/Presets";
import type { Directories } from "#types/Directories";
import type { Globs } from "#types/Globs";

const directoriesSchema: GenericSchema<Directories> = array(directorySchema);

const globsSchema: GenericSchema<Globs> = array(globSchema);

const presetsSchema: GenericSchema<Presets> = array(presetSchema);

export const configSchema = strictObject({
  presets: optional(presetsSchema),
  directories: optional(
    strictObject({
      source: optional(directoriesSchema),
      test: optional(directoriesSchema),
      coverage: optional(directorySchema),
      output: optional(directorySchema),
    }),
  ),
  build: optional(
    strictObject({
      emptyOutDir: optional(boolean()),
    }),
  ),
  files: optional(
    strictObject({
      code: optional(globSchema),
      test: optional(globSchema),
      fixtures: optional(globSchema),
      config: optional(globsSchema),
      discovered: optional(globsSchema),
      generated: optional(globsSchema),
      gitignore: optional(fileSchema),
      prettierignore: optional(fileSchema),
      tsconfig: optional(fileSchema),
      distTsconfig: optional(fileSchema),
    }),
  ),
  agents: optional(
    strictObject({
      instructionFiles: optional(globsSchema),
      snippetsDirectory: optional(directorySchema),
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
