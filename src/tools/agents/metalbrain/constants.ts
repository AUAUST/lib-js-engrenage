import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export const metalbrainProgram = "metalbrain";

export const metalbrainProgramSource = `bin/${metalbrainProgram}/executable.ts` satisfies File;

// @debt restates the package name `#constants` owns, as importing it would load `@auaust/toolkit` into the hook
export const modelFactsSpecifier = "@auaust/engrenage/metalbrain/models.json";

export const statsDirectory = ".ai/stats" satisfies Directory;

export const mainAgent = "main";

export const callsExtension = ".calls.jsonl";

export const startsDirectory = "starts";

// @debt restates the package name `#constants` owns, as importing it would load `@auaust/toolkit` into the hook
export const budgetsSpecifier = "@auaust/engrenage/metalbrain/budgets.json";

// @debt restates the level names `data/metalbrain/budgets.json` › `levels` owns, so a level added there alone is dropped by `parseBudgets`
export const budgetLevels = ["scoped", "standard"] as const;

export const budgetExtension = ".budget.json";
