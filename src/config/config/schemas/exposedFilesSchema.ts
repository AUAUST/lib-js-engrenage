import { check, pipe, record, string } from "valibot";

import { entries } from "@auaust/toolkit/object";

import { fileSchema } from "#config/config/schemas/fileSchema";

function countWildcards(value: string): number {
  return value.split("*").length - 1;
}

export const exposedFilesSchema = pipe(
  record(string(), fileSchema),
  check((exposed) => {
    return entries(exposed).every(([subpath, target]) => {
      const wildcards = countWildcards(subpath);

      return wildcards <= 1 && wildcards === countWildcards(target);
    });
  }, "Each exposed subpath and its target need the same number of '*', at most one"),
);
