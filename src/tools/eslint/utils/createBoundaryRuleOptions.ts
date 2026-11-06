import type { DependenciesPolicy } from "eslint-plugin-boundaries";

import type { BoundaryRow } from "#tools/eslint/types/BoundaryRow";

export function createBoundaryRuleOptions(
  policies: Readonly<
    Partial<Record<BoundaryRow, readonly DependenciesPolicy[] | undefined>>
  >,
): Record<string, { policies: readonly DependenciesPolicy[] } | undefined> {
  function options(row: BoundaryRow) {
    const rowPolicies = policies[row];

    return rowPolicies === undefined ? undefined : { policies: rowPolicies };
  }

  return {
    importEnvironments: options("environments"),
    importTests: options("tests"),
    importData: options("data"),
    importWorkspaces: options("workspaces"),
  };
}
