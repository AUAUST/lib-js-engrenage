import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";

export default defineConvention({
  delegates: ({ typescript }) => {
    return typescript.verbatimModuleSyntax
      ? [
          delegateRule("@typescript-eslint/consistent-type-imports", [
            {
              fixStyle: "inline-type-imports",
            },
          ]),
          delegateRule("@typescript-eslint/no-import-type-side-effects"),
        ]
      : [];
  },
});
