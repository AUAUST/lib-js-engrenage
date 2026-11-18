import { readFile } from "node:fs/promises";

import {
  isWithin,
  pathExists,
  relativeWithin,
} from "#foundation/filesystem/index";
import { getOverBudgetEntries } from "#tools/agents/utils/getOverBudgetEntries";
import { isBacklogEntryFile } from "#tools/agents/utils/isBacklogEntryFile";
import type { BudgetFinding } from "#tools/agents/types/BudgetFinding";
import type { Budgets } from "#tools/agents/types/Budgets";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export async function measureEditedFile(
  root: Directory,
  file: File,
  budgets: Budgets,
): Promise<BudgetFinding[]> {
  if (
    !isWithin(root, file) ||
    !(await pathExists(file)) ||
    !isBacklogEntryFile(relativeWithin(root, file))
  ) {
    return [];
  }

  return getOverBudgetEntries(await readFile(file, "utf-8"), {
    kind: "backlogEntry",
    budget: budgets.backlogEntry,
  });
}
