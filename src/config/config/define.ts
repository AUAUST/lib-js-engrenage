import { freeze } from "@auaust/toolkit/object";

import { defaultGlobalScope, definitionKey } from "#config/constants";
import type { Definition } from "#config/types/Definition";
import type { DefinitionOptions } from "#config/types/DefinitionOptions";
import type { JsonValue } from "#support/json/types/JsonValue";

export function define(
  value: JsonValue,
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
