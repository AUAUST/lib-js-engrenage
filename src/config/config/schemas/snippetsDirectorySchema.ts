import { optional } from "valibot";

import { directorySchema } from "#config/config/schemas/directorySchema";

export const snippetsDirectorySchema = optional(directorySchema);
