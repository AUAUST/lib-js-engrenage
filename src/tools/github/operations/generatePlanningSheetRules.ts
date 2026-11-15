import { planningSheetRule } from "#tools/github/constants";
import { issueDraftsDirectory } from "#tools/github/issues/drafts/constants";
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
