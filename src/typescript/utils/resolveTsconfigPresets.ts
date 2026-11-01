import { createRequire } from "node:module";
import { dirname } from "node:path";

import { engrenage } from "#constants";
import type { Directory } from "#types/Directory";

export function resolveTsconfigPresets(): Directory {
  return dirname(
    createRequire(import.meta.url).resolve(`${engrenage}/tsconfig/base.json`),
  );
}
