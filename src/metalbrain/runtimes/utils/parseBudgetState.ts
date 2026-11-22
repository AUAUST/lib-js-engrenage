import { isBudgetLevel } from "#metalbrain/runtimes/utils/isBudgetLevel";
import { isFiniteNumber } from "#metalbrain/runtimes/utils/isFiniteNumber";
import { isRecord } from "#metalbrain/runtimes/utils/isRecord";
import { isText } from "#metalbrain/runtimes/utils/isText";
import type { BudgetState } from "#metalbrain/runtimes/types/BudgetState";
import type { BudgetWarning } from "#metalbrain/runtimes/types/BudgetWarning";

function fail(path: string, expected: string): never {
  throw new Error(`Budget state: ${path} must be ${expected}`);
}

function readNumber(value: unknown, path: string): number {
  return isFiniteNumber(value) ? value : fail(path, "a number");
}

function readWarning(value: unknown, index: number): BudgetWarning {
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
 * Reads a subagent's budget state file, failing when it does not match its schema.
 */
export function parseBudgetState(value: unknown): BudgetState {
  if (!isRecord(value)) {
    fail("the file", "an object");
  }

  const { level, budget, warnings, start, opened, scanned } = value;

  if (!Array.isArray(warnings)) {
    fail("warnings", "an array");
  }

  return {
    level: isBudgetLevel(level) ? level : fail("level", "a budget level"),
    budget: readNumber(budget, "budget"),
    warnings: warnings.map(readWarning),
    start: readNumber(start, "start"),
    opened: readNumber(opened, "opened"),
    scanned: readNumber(scanned, "scanned"),
  };
}
