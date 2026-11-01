import { readdirSync } from "node:fs";
import { join, parse } from "node:path";

import { map, sort } from "@auaust/primitive-kit/arrays";

import { resolveTsconfigPresets } from "#typescript/utils/resolveTsconfigPresets";

export function listTsconfigPresets(kind: "baseline" | "node"): string[] {
  return sort(
    map(readdirSync(join(resolveTsconfigPresets(), kind)), (file) => {
      return parse(file).name;
    }),
    (a, b) => a.localeCompare(b, "en", { numeric: true }),
  );
}
