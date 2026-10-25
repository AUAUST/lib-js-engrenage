import { globSchema } from "#config/config/schemas/globSchema";
import { optional } from "valibot";

export const testFilesSchema = optional(
  globSchema,
  "**/*.{test,spec}.{ts,tsx}",
);
