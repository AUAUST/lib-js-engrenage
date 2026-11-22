import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

import { budgetsSpecifier } from "#metalbrain/runtimes/constants";
import { parseBudgets } from "#metalbrain/runtimes/utils/parseBudgets";
import type { Budgets } from "#metalbrain/runtimes/types/Budgets";

/**
 * Reads the budgets the package ships, failing when they do not match
 * their schema.
 */
export async function readBudgets(): Promise<Budgets> {
  const file = createRequire(import.meta.url).resolve(budgetsSpecifier);

  return parseBudgets(JSON.parse(await readFile(file, "utf-8")));
}
