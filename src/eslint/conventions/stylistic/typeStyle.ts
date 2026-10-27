import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("@typescript-eslint/adjacent-overload-signatures"),
    delegateRule("@typescript-eslint/consistent-generic-constructors", [
      "constructor",
    ]),
    delegateRule("@typescript-eslint/consistent-type-assertions", [
      {
        assertionStyle: "as",
        objectLiteralTypeAssertions: "never",
      },
    ]),
    delegateRule("@typescript-eslint/method-signature-style", ["method"]),
    delegateRule("@typescript-eslint/no-extraneous-class"),
    delegateRule("@typescript-eslint/no-inferrable-types"),
    delegateRule("@typescript-eslint/no-invalid-void-type", [
      {
        allowAsThisParameter: true,
        allowInGenericTypeArguments: true,
      },
    ]),
    delegateRule("@typescript-eslint/prefer-function-type"),
    delegateRule("@typescript-eslint/unified-signatures"),
    delegateRule("unicorn/prefer-type-literal-last"),
  ],
});
