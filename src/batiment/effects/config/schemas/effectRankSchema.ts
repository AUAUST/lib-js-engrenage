import { object, record, string, union } from "valibot";

export const effectRankSchema = union([
  string(),
  object({
    level: string(),
    symbols: record(string(), string()),
  }),
]);
