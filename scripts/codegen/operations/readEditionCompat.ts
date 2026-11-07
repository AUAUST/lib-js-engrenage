import { readFile } from "node:fs/promises";

import {
  literal,
  looseObject,
  object,
  optional,
  parse,
  string,
  union,
  unknown,
  record as vrecord,
} from "valibot";

import { entries, values } from "@auaust/toolkit/object";

import { mergeCompatDates } from "#scripts/codegen/utils/mergeCompatDates";
import type { Compat } from "#scripts/codegen/types/Compat";
import type { File } from "#types/File";

const compatSchema = object({
  features: vrecord(
    string(),
    looseObject({
      kind: string(),
      discouraged: optional(unknown()),
      status: optional(
        looseObject({
          by_compat_key: optional(
            vrecord(
              string(),
              looseObject({
                baseline: union([literal(false), string()]),
                baseline_low_date: optional(string()),
              }),
            ),
          ),
        }),
      ),
    }),
  ),
});

export async function readEditionCompat(
  featuresFile: File,
): Promise<Map<string, Compat>> {
  const { features } = parse(
    compatSchema,
    JSON.parse(await readFile(featuresFile, "utf-8")),
  );

  const compat = new Map<string, Compat>();

  for (const feature of values(features)) {
    if (feature.kind !== "feature") {
      continue;
    }

    for (const [key, status] of entries(feature.status?.by_compat_key ?? {})) {
      const date =
        status.baseline === false || status.baseline_low_date == null
          ? null
          : status.baseline_low_date.replace("≤", "");

      const discouraged = feature.discouraged != null;
      const known = compat.get(key);

      compat.set(
        key,
        known === undefined
          ? { date, discouraged }
          : {
              date: mergeCompatDates([known.date, date]) ?? null,
              discouraged: known.discouraged && discouraged,
            },
      );
    }
  }

  return compat;
}
