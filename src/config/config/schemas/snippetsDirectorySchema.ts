import { directorySchema } from "#config/config/schemas/directorySchema";
import { optional } from "valibot";

export const snippetsDirectorySchema = optional(directorySchema);
