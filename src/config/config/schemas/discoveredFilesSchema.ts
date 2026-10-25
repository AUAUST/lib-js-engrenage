import { array, optional } from "valibot";

import { globSchema } from "#config/config/schemas/globSchema";

export const discoveredFilesSchema = optional(array(globSchema), []);
