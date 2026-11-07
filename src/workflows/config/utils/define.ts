import { freeze } from "@auaust/toolkit/object";

import { defaultGlobalScope, definitionKey } from "#project/config/constants";
import type { Definition, DefinitionOptions } from "#project/config/index";

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
