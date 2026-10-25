import { globSchema } from "#config/config/schemas/globSchema";
import { array, optional } from "valibot";

export const discoveredFilesSchema = optional(array(globSchema), []);
