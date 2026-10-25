import type { RestrictedProperty } from "#eslint/types/RestrictedProperty";
import type { Rules } from "#eslint/types/Rules";

export function restrictProperties(...properties: RestrictedProperty[]): Rules {
  return {
    "no-restricted-properties": ["error", ...properties],
  };
}
