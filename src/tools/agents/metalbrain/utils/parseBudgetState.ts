import { isFinite } from "@auaust/toolkit/number";

import { isBudgetLevel } from "#tools/agents/metalbrain/utils/isBudgetLevel";
import { isRecord } from "#tools/agents/metalbrain/utils/isRecord";
import { isText } from "#tools/agents/metalbrain/utils/isText";
import type { BudgetState } from "#tools/agents/metalbrain/types/BudgetState";
import type { BudgetWarning } from "#tools/agents/metalbrain/types/BudgetWarning";

function fail(path: string, expected: string): never {
  throw new Error(`Budget state: ${path} must be ${expected}`);
}

function readNumber(value: unknown, path: string): number {
  return isFinite(value) ? value : fail(path, "a number");
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

  const { start, level, budget, warnings } = value;

  if (!Array.isArray(warnings)) {
    fail("warnings", "an array");
  }

  return {
    start: readNumber(start, "start"),
    level: isBudgetLevel(level) ? level : fail("level", "a budget level"),
    budget: readNumber(budget, "budget"),
    warnings: warnings.map(readWarning),
  };
}
