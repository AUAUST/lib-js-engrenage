import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("@typescript-eslint/consistent-type-assertions", [
      {
        assertionStyle: "as",
        objectLiteralTypeAssertions: "allow",
        arrayLiteralTypeAssertions: "allow",
      },
    ]),
    delegateRule("@typescript-eslint/no-inferrable-types"),
    delegateRule("@typescript-eslint/no-invalid-void-type", [
      {
        allowAsThisParameter: true,
        allowInGenericTypeArguments: true,
      },
    ]),
  ],
});
