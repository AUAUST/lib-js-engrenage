import { array, optional } from "valibot";

import { globSchema } from "#config/config/schemas/globSchema";
import { defaultInstructionFiles } from "#config/constants";

export const instructionFilesSchema = optional(
  array(globSchema),
  defaultInstructionFiles,
);
