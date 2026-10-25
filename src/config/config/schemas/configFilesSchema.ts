import { globSchema } from "#config/config/schemas/globSchema";
import { array, optional } from "valibot";

export const configFilesSchema = optional(array(globSchema), [
  "*.config.ts",
  ".*.ts",
]);
