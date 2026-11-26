import { rootScope } from "#batiment/scopes/constants";
import type { EnvironmentInstance } from "#batiment/environments/index";

/**
 * Names an instance `engrenage typecheck` skips, with its scope outside the root
 * and the reason it is skipped.
 */
export function describeSkippedInstance(
  { environment, scope }: EnvironmentInstance,
  reason: string,
): string {
  const name = scope === rootScope ? environment : `${environment} in ${scope}`;

  return `${name} (${reason})`;
}
