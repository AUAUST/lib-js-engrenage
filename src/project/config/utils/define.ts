import { freeze } from "@auaust/toolkit/object";

import { defaultGlobalScope, definitionKey } from "#project/config/constants";
import type { Definition } from "#project/config/types/Definition";
import type { DefinitionOptions } from "#project/config/types/DefinitionOptions";

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
