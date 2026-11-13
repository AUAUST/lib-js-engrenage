import { freeze } from "@auaust/toolkit/object";

import { defaultGlobalScope, definitionKey } from "#project/config/constants";
import type { Definition, DefinitionOptions } from "#project/config/index";

/**
 * Wraps a `define.values` global with how the env file declares it and where it
 * applies. `type` replaces the inferred type, `exact` infers a readonly literal
 * type instead of a widened one, `scope` limits it to test or build tools, and
 * `description` documents its declaration.
 */
export function define(
  value: unknown,
  {
    exact = false,
    type,
    scope = defaultGlobalScope,
    description,
  }: DefinitionOptions = {},
): Definition {
  return freeze({
    [definitionKey]: true,
    value,
    exact,
    type,
    scope,
    description,
  });
}
