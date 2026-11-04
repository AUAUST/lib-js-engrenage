import { dirname } from "node:path";

import { engrenage } from "#constants";
import { resolveDataFile } from "#data/operations/resolveDataFile";
import type { Directory } from "#types/Directory";

export function resolveTsconfigPresets(): Directory {
  return dirname(resolveDataFile(`${engrenage}/tsconfig/base.json`));
}
