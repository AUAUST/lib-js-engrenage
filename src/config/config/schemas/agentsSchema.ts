import { instructionFilesSchema } from "#config/config/schemas/instructionFilesSchema";
import { snippetsDirectorySchema } from "#config/config/schemas/snippetsDirectorySchema";
import { optional, strictObject } from "valibot";

export const agentsSchema = optional(
  strictObject({
    instructionFiles: instructionFilesSchema,
    snippetsDirectory: snippetsDirectorySchema,
  }),
  {},
);
