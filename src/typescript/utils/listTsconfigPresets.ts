import { readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, parse } from "node:path";

import { map, sort } from "@auaust/primitive-kit/arrays";

import { engrenage } from "#constants";

export function listTsconfigPresets(kind: "baseline" | "node"): string[] {
  const presets = dirname(
    createRequire(import.meta.url).resolve(`${engrenage}/tsconfig/base.json`),
  );

  return sort(
    map(readdirSync(join(presets, kind)), (file) => {
      return parse(file).name;
    }),
    (a, b) => a.localeCompare(b, "en", { numeric: true }),
  );
}
