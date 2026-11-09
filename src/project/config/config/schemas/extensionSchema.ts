import { custom } from "valibot";

import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { isString } from "@auaust/toolkit/isString";

import type { Extension } from "#project/config/types/Extension";

export const extensionSchema = custom<Extension>((value) => {
  return isPlainObject(value) && isString(value.name);
}, "Expected an extension: an object with a string name");
