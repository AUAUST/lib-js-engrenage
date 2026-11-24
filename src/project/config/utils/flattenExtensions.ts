import { isArray } from "@auaust/toolkit";
import { flatMap } from "@auaust/toolkit/array";

import type { Extension } from "#project/config/types/Extension";
import type { ExtensionOption } from "#project/config/types/ExtensionOption";

// @debt toolkit's `isArray` narrows to `any[]`, which a readonly list is not assignable to, so a local guard restates it
function isExtensionList(
  option: ExtensionOption,
): option is readonly ExtensionOption[] {
  return isArray(option);
}

export function flattenExtensions(
  options: readonly ExtensionOption[],
): readonly Extension[] {
  return flatMap(options, (option) => {
    return isExtensionList(option) ? flattenExtensions(option) : [option];
  });
}
