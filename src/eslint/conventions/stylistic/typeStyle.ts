import type { Rule } from "eslint";

import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";
import type { ReportDescriptor } from "#eslint/types/ReportDescriptor";

function isEmptyObjectAssertion(
  descriptor: ReportDescriptor,
  { sourceCode }: Rule.RuleContext,
): boolean {
  if (
    !("messageId" in descriptor) ||
    descriptor.messageId !== "unexpectedObjectTypeAssertion" ||
    !("node" in descriptor) ||
    descriptor.node.loc == null
  ) {
    return false;
  }

  const assertedNode = sourceCode.getNodeByRangeIndex(
    sourceCode.getIndexFromLoc(descriptor.node.loc.start),
  );

  return (
    assertedNode?.type === "ObjectExpression" &&
    assertedNode.properties.length === 0
  );
}

export default defineConvention({
  delegates: [
    delegateRule("@typescript-eslint/adjacent-overload-signatures"),
    delegateRule("@typescript-eslint/consistent-generic-constructors", [
      "constructor",
    ]),
    delegateRule(
      "@typescript-eslint/consistent-type-assertions",
      [
        {
          assertionStyle: "as",
          objectLiteralTypeAssertions: "never",
        },
      ],
      {
        ignoreReport: isEmptyObjectAssertion,
      },
    ),
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
