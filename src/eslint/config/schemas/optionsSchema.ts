import { keys } from "@auaust/toolkit/object";
import {
  boolean,
  optional,
  picklist,
  record,
  strictObject,
  union,
} from "valibot";

import { conventionCategories } from "#eslint/constants";
import type { Convention } from "#eslint/types/Convention";

function categorySchema<Name extends string>(
  category: Record<Name, Convention>,
) {
  return optional(
    union([boolean(), record(picklist(keys(category)), boolean())]),
    true,
  );
}

export const optionsSchema = strictObject({
  ignore: optional(boolean(), true),
  recommended: optional(boolean(), true),
  globals: categorySchema(conventionCategories.globals),
  comparisons: categorySchema(conventionCategories.comparisons),
  stylistic: categorySchema(conventionCategories.stylistic),
  imports: categorySchema(conventionCategories.imports),
  promises: categorySchema(conventionCategories.promises),
  structure: categorySchema(conventionCategories.structure),
});
