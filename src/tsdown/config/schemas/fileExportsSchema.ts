import { optional, record, string } from "valibot";

import { globSchema } from "#config/config/schemas/globSchema";

export const fileExportsSchema = optional(record(string(), globSchema), {});
