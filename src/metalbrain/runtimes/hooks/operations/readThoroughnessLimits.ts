import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

import { thoroughnessLimitsSpecifier } from "#metalbrain/runtimes/hooks/constants";
import { parseThoroughnessLimits } from "#metalbrain/runtimes/hooks/utils/parseThoroughnessLimits";
import type { ThoroughnessLimits } from "#metalbrain/runtimes/types/ThoroughnessLimits";

/**
 * Reads the thoroughness limits the package ships, failing when they do not
 * match their schema.
 */
export async function readThoroughnessLimits(): Promise<ThoroughnessLimits> {
  const file = createRequire(import.meta.url).resolve(
    thoroughnessLimitsSpecifier,
  );

  return parseThoroughnessLimits(JSON.parse(await readFile(file, "utf-8")));
}
