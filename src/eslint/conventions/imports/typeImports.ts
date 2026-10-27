import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("@typescript-eslint/consistent-type-imports", [
      {
        fixStyle: "inline-type-imports",
      },
    ]),
    delegateRule("@typescript-eslint/no-import-type-side-effects"),
  ],
});
