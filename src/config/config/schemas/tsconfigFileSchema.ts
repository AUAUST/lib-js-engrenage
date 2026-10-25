import { defaultTsconfigFile } from "#config/constants";
import { fileSchema } from "#config/config/schemas/fileSchema";
import { optional } from "valibot";

export const tsconfigFileSchema = optional(fileSchema, defaultTsconfigFile);
