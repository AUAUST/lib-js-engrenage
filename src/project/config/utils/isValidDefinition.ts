import { includes } from "@auaust/primitive-kit/arrays";
import { isBoolean } from "@auaust/toolkit/isBoolean";
import { isString } from "@auaust/toolkit/isString";

import { globalScopes } from "#project/config/constants";
import type { Definition } from "#project/config/types/Definition";

export function isValidDefinition(input: Definition): boolean {
  return (
    isBoolean(input.exact) &&
    (input.type === undefined || isString(input.type)) &&
    includes(globalScopes, input.scope) &&
    (input.description === undefined ||
      (isString(input.description) && !input.description.includes("*/")))
  );
}
