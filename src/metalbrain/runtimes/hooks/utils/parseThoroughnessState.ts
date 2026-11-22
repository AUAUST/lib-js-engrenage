import { isFiniteNumber } from "#metalbrain/runtimes/hooks/utils/isFiniteNumber";
import { isRecord } from "#metalbrain/runtimes/hooks/utils/isRecord";
import { isText } from "#metalbrain/runtimes/hooks/utils/isText";
import { isThoroughnessLevel } from "#metalbrain/runtimes/hooks/utils/isThoroughnessLevel";
import type { ThoroughnessState } from "#metalbrain/runtimes/types/ThoroughnessState";
import type { ThoroughnessWarning } from "#metalbrain/runtimes/types/ThoroughnessWarning";

function fail(path: string, expected: string): never {
  throw new Error(`Thoroughness state: ${path} must be ${expected}`);
}

function readNumber(value: unknown, path: string): number {
  return isFiniteNumber(value) ? value : fail(path, "a number");
}

function readWarning(value: unknown, index: number): ThoroughnessWarning {
  const path = `warnings[${index}]`;

  if (!isRecord(value)) {
    fail(path, "an object");
  }

  return {
    time: isText(value.time) ? value.time : fail(`${path}.time`, "a string"),
    gain: readNumber(value.gain, `${path}.gain`),
  };
}

/**
 * Reads a subagent's thoroughness state file, failing when it does not
 * match its schema.
 */
export function parseThoroughnessState(value: unknown): ThoroughnessState {
  if (!isRecord(value)) {
    fail("the file", "an object");
  }

  const { level, limit, warnings, start, opened, scanned } = value;

  if (!Array.isArray(warnings)) {
    fail("warnings", "an array");
  }

  return {
    level: isThoroughnessLevel(level)
      ? level
      : fail("level", "a thoroughness level"),
    limit: readNumber(limit, "limit"),
    warnings: warnings.map(readWarning),
    start: readNumber(start, "start"),
    opened: readNumber(opened, "opened"),
    scanned: readNumber(scanned, "scanned"),
  };
}
