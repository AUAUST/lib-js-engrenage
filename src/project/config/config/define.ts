import { freeze } from "@auaust/toolkit/object";

import { defaultGlobalScope, definitionKey } from "#config/constants";
import type { Definition } from "#config/types/Definition";
import type { DefinitionOptions } from "#config/types/DefinitionOptions";

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
  } as const);
}
