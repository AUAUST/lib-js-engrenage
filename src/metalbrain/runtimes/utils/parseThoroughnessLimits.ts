import { isFiniteNumber } from "#metalbrain/runtimes/utils/isFiniteNumber";
import { isRecord } from "#metalbrain/runtimes/utils/isRecord";
import type { ThoroughnessLevel } from "#metalbrain/runtimes/types/ThoroughnessLevel";
import type { ThoroughnessLimits } from "#metalbrain/runtimes/types/ThoroughnessLimits";

function fail(path: string, expected: string): never {
  throw new Error(`Thoroughness limits: ${path} must be ${expected}`);
}

/**
 * Reads the thoroughness limits file, failing unless it gives each thoroughness
 * level a positive token count.
 */
export function parseThoroughnessLimits(value: unknown): ThoroughnessLimits {
  if (!isRecord(value)) {
    fail("the file", "an object");
  }

  const levels = isRecord(value.levels)
    ? value.levels
    : fail("levels", "an object");

  function read(level: ThoroughnessLevel): number {
    const limit = levels[level];

    return isFiniteNumber(limit) && limit > 0
      ? limit
      : fail(`levels.${level}`, "a positive number");
  }

  return {
    levels: { scoped: read("scoped"), standard: read("standard") },
  };
}
