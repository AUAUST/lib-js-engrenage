import { freeze } from "@auaust/toolkit/object";

import { defaultGlobalScope, definitionKey } from "#project/config/constants";
import type { Definition } from "#project/config/types/Definition";
import type { DefinitionOptions } from "#project/config/types/DefinitionOptions";

/** @debt #196 places `define` in workflows/config; it stays here because it needs internals that project/config does not export. The nine public-specifier tests that used internals of `@auaust/engrenage/config` became source-mode only and no longer run against dist */
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
