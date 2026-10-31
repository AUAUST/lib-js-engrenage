import { literal, strictObject, union, type ObjectEntries } from "valibot";

export function environmentSchema<const Entries extends ObjectEntries>(
  entries: Entries,
) {
  return union([literal(false), strictObject(entries)]);
}
