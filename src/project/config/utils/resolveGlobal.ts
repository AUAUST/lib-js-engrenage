import { defaultGlobalScope } from "#project/config/constants";
import { isDefinition } from "#project/config/utils/isDefinition";
import { serialize } from "#project/config/utils/serialize";
import type { JsonValue } from "#foundation/json/index";
import type { ResolvedGlobal } from "#project/config/types/ResolvedGlobal";

export function resolveGlobal(input: unknown): ResolvedGlobal {
  const definition = isDefinition(input) ? input : undefined;

  const expression = serialize(
    definition === undefined ? input : definition.value,
  );

  const value: JsonValue = JSON.parse(expression);

  return {
    expression,
    value,
    exact: definition?.exact ?? false,
    type: definition?.type,
    scope: definition?.scope ?? defaultGlobalScope,
    description: definition?.description,
  };
}
