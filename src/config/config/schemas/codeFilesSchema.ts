import { optional } from "valibot";

import { globSchema } from "#config/config/schemas/globSchema";
import { defaultCodeFiles } from "#config/constants";

export const codeFilesSchema = optional(globSchema, defaultCodeFiles);
