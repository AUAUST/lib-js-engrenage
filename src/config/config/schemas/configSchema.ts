import { optional, strictObject } from "valibot";

import { directoriesSchema } from "#config/config/schemas/directoriesSchema";
import { directorySchema } from "#config/config/schemas/directorySchema";
import { fileSchema } from "#config/config/schemas/fileSchema";
import { globSchema } from "#config/config/schemas/globSchema";
import { globsSchema } from "#config/config/schemas/globsSchema";

export const configSchema = strictObject({
  directories: optional(
    strictObject({
      source: optional(directoriesSchema),
      test: optional(directoriesSchema),
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
});
