import { defaultInstructionFiles } from "#config/constants/defaultInstructionFiles";
import { globSchema } from "#config/config/schemas/globSchema";
import { array, optional } from "valibot";

export const instructionFilesSchema = optional(
  array(globSchema),
  defaultInstructionFiles,
);
