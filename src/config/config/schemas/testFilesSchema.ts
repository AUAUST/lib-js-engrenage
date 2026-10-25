import { globSchema } from "#config/config/schemas/globSchema";
import { defaultTestFiles } from "#config/constants";
import { optional } from "valibot";

export const testFilesSchema = optional(globSchema, defaultTestFiles);
