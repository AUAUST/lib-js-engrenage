import { optional, strictObject } from "valibot";

import { instructionFilesSchema } from "#config/config/schemas/instructionFilesSchema";
import { snippetsDirectorySchema } from "#config/config/schemas/snippetsDirectorySchema";

export const agentsSchema = optional(
  strictObject({
    instructionFiles: instructionFilesSchema,
    snippetsDirectory: snippetsDirectorySchema,
  }),
  {},
);
