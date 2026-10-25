import { defaultTsconfigFile } from "#config/constants/defaultTsconfigFile";
import { fileSchema } from "#config/config/schemas/fileSchema";
import { optional } from "valibot";

export const tsconfigFileSchema = optional(fileSchema, defaultTsconfigFile);
