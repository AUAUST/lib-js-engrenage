import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule(
      "func-style",
      [
        "declaration",
        {
          allowTypeAnnotation: true,
          allowArrowFunctions: true,
        },
      ],
      {
        name: "prefer-function-declaration",
      },
    ),
    delegateRule("@typescript-eslint/adjacent-overload-signatures"),
    delegateRule("@typescript-eslint/unified-signatures", [
      {
        ignoreDifferentlyNamedParameters: true,
        ignoreOverloadsWithDifferentJSDoc: true,
      },
    ]),
  ],
});
