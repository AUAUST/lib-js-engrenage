import { optional } from "valibot";

import { fileSchema } from "#config/config/schemas/fileSchema";
import { defaultTsconfigFile } from "#config/constants";

export const tsconfigFileSchema = optional(fileSchema, defaultTsconfigFile);
