import { object, record, string, union } from "valibot";

export const effectModuleSchema = union([
  string(),
  object({
    default: string(),
    symbols: record(string(), string()),
  }),
]);
