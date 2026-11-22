import type { Directory } from "#types/Directory";

// @debt restates the package name `#constants` owns, as importing it would load `@auaust/toolkit` into the hook
export const modelFactsSpecifier = "@auaust/engrenage/metalbrain/models.json";

export const statsDirectory = ".ai/stats" satisfies Directory;

export const mainAgent = "main";

export const callsExtension = ".calls.jsonl";

export const startsDirectory = "starts";

// @debt restates the package name `#constants` owns, as importing it would load `@auaust/toolkit` into the hook
export const thoroughnessLimitsSpecifier = "@auaust/engrenage/metalbrain/thoroughness.json";

// @debt restates the level names `data/metalbrain/thoroughness.json` › `levels` owns, so a level added there alone is dropped by `parseThoroughnessLimits`
export const thoroughnessLevels = ["scoped", "standard"] as const;

export const thoroughnessExtension = ".thoroughness.json";
