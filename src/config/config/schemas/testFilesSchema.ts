import { optional } from "valibot";

import { globSchema } from "#config/config/schemas/globSchema";
import { defaultTestFiles } from "#config/constants";

export const testFilesSchema = optional(globSchema, defaultTestFiles);
