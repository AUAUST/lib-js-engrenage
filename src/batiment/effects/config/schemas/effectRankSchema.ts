import { object, optional, record, string, union } from "valibot";

export const effectRankSchema = union([
  string(),
  object({
    level: string(),
    evaluation: optional(string()),
    symbols: optional(record(string(), string())),
  }),
]);
