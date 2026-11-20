import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

import { budgetsSpecifier } from "#tools/agents/metalbrain/constants";
import { parseBudgets } from "#tools/agents/metalbrain/utils/parseBudgets";
import type { Budgets } from "#tools/agents/metalbrain/types/Budgets";

/**
 * Reads the budgets the package ships, failing when they do not match
 * their schema.
 */
export async function readBudgets(): Promise<Budgets> {
  const file = createRequire(import.meta.url).resolve(budgetsSpecifier);

  return parseBudgets(JSON.parse(await readFile(file, "utf-8")));
}
