import type { JsonValue } from "#foundation/json/index";

/**
 * A value sync writes at its location in a `package.json`.
 */
export interface PackageField {
  readonly location: readonly [string] | readonly [string, string];
  readonly value: JsonValue;
}
