import { posix } from "node:path";

import { backlogIndex, debtFile } from "#tools/agents/constants";
import type { BudgetKind } from "#tools/agents/types/BudgetKind";

export function getEntryBudgetKind(
  file: string,
): Extract<BudgetKind, "backlogEntry" | "debtEntry"> | undefined {
  if (file === debtFile) {
    return "debtEntry";
  }

  if (
    file !== backlogIndex &&
    posix.dirname(file) === posix.dirname(backlogIndex) &&
    posix.extname(file) === ".md"
  ) {
    return "backlogEntry";
  }
}
