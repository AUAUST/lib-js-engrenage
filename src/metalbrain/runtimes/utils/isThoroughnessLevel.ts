import { thoroughnessLevels } from "#metalbrain/runtimes/constants";
import type { ThoroughnessLevel } from "#metalbrain/runtimes/types/ThoroughnessLevel";

export function isThoroughnessLevel(
  value: unknown,
): value is ThoroughnessLevel {
  return thoroughnessLevels.some((level) => level === value);
}
