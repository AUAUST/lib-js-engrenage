import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("@typescript-eslint/consistent-generic-constructors", [
      "constructor",
    ]),
    delegateRule("@typescript-eslint/method-signature-style", ["method"]),
    delegateRule("@typescript-eslint/no-extraneous-class"),
    delegateRule("@typescript-eslint/prefer-function-type"),
    delegateRule("unicorn/prefer-type-literal-last"),
  ],
});
