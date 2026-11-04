import { isPlainObject } from "@auaust/toolkit/isPlainObject";

import { definitionKey } from "#project/config/constants";
import type { Definition } from "#project/config/types/Definition";

export function isDefinition(input: unknown): input is Definition {
  return isPlainObject(input) && input[definitionKey] === true;
}
