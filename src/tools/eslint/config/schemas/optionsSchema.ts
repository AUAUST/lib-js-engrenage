import {
  array,
  boolean,
  custom,
  optional,
  picklist,
  record,
  strictObject,
  union,
} from "valibot";
import type { DependenciesPolicy } from "eslint-plugin-boundaries";

import { isObject } from "@auaust/toolkit/isObject";
import { keys } from "@auaust/toolkit/object";

import { conventionCategories } from "#tools/eslint/constants";
import type { Convention } from "#tools/eslint/types/Convention";

const boundaryPolicies = optional(
  array(custom<DependenciesPolicy>(isObject, "Expected a boundaries policy")),
);

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
  packageJson: optional(boolean(), true),
  typeAware: optional(boolean(), true),
  globals: categorySchema(conventionCategories.globals),
  comparisons: categorySchema(conventionCategories.comparisons),
  stylistic: categorySchema(conventionCategories.stylistic),
  imports: categorySchema(conventionCategories.imports),
  promises: categorySchema(conventionCategories.promises),
  structure: categorySchema(conventionCategories.structure),
  boundaries: optional(
    strictObject({
      environments: boundaryPolicies,
      tests: boundaryPolicies,
      data: boundaryPolicies,
      workspaces: boundaryPolicies,
      layers: boundaryPolicies,
      surfaces: boundaryPolicies,
    }),
    {},
  ),
  performance: categorySchema(conventionCategories.performance),
});
