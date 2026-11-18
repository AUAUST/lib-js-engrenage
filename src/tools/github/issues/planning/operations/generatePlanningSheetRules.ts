import { issueDraftsDirectory } from "#tools/github/issues/drafts/constants";
import { planningSheetRule } from "#tools/github/issues/planning/constants";
import type { Globs } from "#types/Globs";

export function generatePlanningSheetRules(): Promise<
  readonly { name: string; paths: Globs; directives: readonly string[] }[]
> {
  return Promise.resolve([
    {
      name: planningSheetRule,
      paths: [`${issueDraftsDirectory}**`],
      directives: [planningSheetRule],
    },
  ]);
}
