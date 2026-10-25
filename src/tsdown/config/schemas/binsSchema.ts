import { optional, record, string } from "valibot";

import { fileSchema } from "#config/config/schemas/fileSchema";

export const binsSchema = optional(record(string(), fileSchema), {});
