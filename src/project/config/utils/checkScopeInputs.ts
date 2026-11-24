import { isNonEmptyArray } from "@auaust/toolkit/array";
import { keys } from "@auaust/toolkit/object";

import type { InputScope } from "#project/config/types/InputScope";

/**
 * Checks that every key of `values` but `fields` is a config input a workspace
 * may set: known, and not project-only.
 *
 * @throws Listing each unknown and project-only key, naming `source`.
 */
export function checkScopeInputs(
  scopes: ReadonlyMap<string, InputScope>,
  values: Readonly<Record<string, unknown>>,
  source: string,
  fields: readonly string[] = [],
): void {
  const listed = keys(values).filter((key) => !fields.includes(key));

  const findings = [
    ...listed
      .filter((key) => !scopes.has(key))
      .map((key) => `Unknown key "${key}"`),
    ...listed
      .filter((key) => scopes.get(key)?.scope === "project")
      .map((key) => {
        return `Config key "${key}" is project-only: set it in the root config`;
      }),
  ];

  if (isNonEmptyArray(findings)) {
    throw new Error(`Invalid ${source}:\n${findings.join("\n")}`);
  }
}
