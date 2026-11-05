import { existsSync, readFileSync } from "node:fs";

import { isWithin, relativeWithin } from "#foundation/filesystem/index";
import { getEntryBudgetKind } from "#tools/agents/utils/getEntryBudgetKind";
import { getOverBudgetEntries } from "#tools/agents/utils/getOverBudgetEntries";
import type { BudgetFinding } from "#tools/agents/types/BudgetFinding";
import type { Budgets } from "#tools/agents/types/Budgets";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export function measureEditedFile(
  root: Directory,
  file: File,
  budgets: Budgets,
): BudgetFinding[] {
  if (!isWithin(root, file) || !existsSync(file)) {
    return [];
  }

  const kind = getEntryBudgetKind(relativeWithin(root, file));

  if (kind === undefined) {
    return [];
  }

  return getOverBudgetEntries(readFileSync(file, "utf-8"), {
    kind,
    budget: budgets[kind],
  });
}
