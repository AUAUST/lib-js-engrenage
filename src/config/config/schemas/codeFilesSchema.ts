import { defaultCodeFiles } from "#config/constants/defaultCodeFiles";
import { globSchema } from "#config/config/schemas/globSchema";
import { optional } from "valibot";

export const codeFilesSchema = optional(globSchema, defaultCodeFiles);
