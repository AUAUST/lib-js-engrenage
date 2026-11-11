import { planningSheetRule } from "#tools/github/constants";

export function generatePlanningSheetRules(): Promise<
  readonly { name: string; directives: readonly string[] }[]
> {
  return Promise.resolve([
    { name: planningSheetRule, directives: [planningSheetRule] },
  ]);
}
