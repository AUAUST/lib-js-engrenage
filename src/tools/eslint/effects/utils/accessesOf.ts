import type { Scope, SourceCode } from "eslint";

import { accessOf } from "#tools/eslint/effects/utils/accessOf";

/**
 * How each reference to `variables` that writes nothing is used, as
 * `accessOf` reads it.
 */
export function* accessesOf(
  sourceCode: SourceCode,
  variables: readonly Scope.Variable[],
) {
  for (const { references } of variables) {
    for (const { identifier } of references) {
      if (identifier.type === "JSXIdentifier") {
        continue;
      }

      const access = accessOf(sourceCode.getAncestors(identifier), identifier);

      if (access !== undefined) {
        yield access;
      }
    }
  }
}
