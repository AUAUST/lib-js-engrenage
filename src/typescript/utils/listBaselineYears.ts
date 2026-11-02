import { readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

import { filter, map, sort } from "@auaust/primitive-kit/arrays";

import { typescriptBaselineLibrary } from "#constants";

export function listBaselineYears(): number[] {
  const library = dirname(
    createRequire(import.meta.url).resolve(
      `${typescriptBaselineLibrary}/package.json`,
    ),
  );

  return sort(
    map(
      filter(readdirSync(join(library, "year")), (name) =>
        /^\d{4}$/.test(name),
      ),
      Number,
    ),
    (a, b) => a - b,
  );
}
