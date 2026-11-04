import type { Rule, SourceCode } from "eslint";

import { flatMap, last } from "@auaust/primitive-kit/arrays";

import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";
import type { ReportDescriptor } from "#eslint/types/ReportDescriptor";

function findTypeParameter(
  sourceCode: SourceCode,
  descriptor: ReportDescriptor,
) {
  const start = "node" in descriptor ? descriptor.node.loc?.start : undefined;

  if (start == null) {
    return;
  }

  const node = sourceCode.getNodeByRangeIndex(
    sourceCode.getIndexFromLoc(start),
  );

  if (node === null) {
    return;
  }

  const type: string = node.type;

  return type === "TSTypeParameter"
    ? node
    : last(sourceCode.getAncestors(node));
}

function isReturnTypeCast(
  descriptor: ReportDescriptor,
  { sourceCode }: Rule.RuleContext,
): boolean {
  const typeParameter = findTypeParameter(sourceCode, descriptor);

  const declaration =
    typeParameter === undefined
      ? undefined
      : last(sourceCode.getAncestors(typeParameter));

  const owner =
    declaration === undefined
      ? undefined
      : last(sourceCode.getAncestors(declaration));

  if (
    typeParameter === undefined ||
    owner === undefined ||
    !("returnType" in owner) ||
    owner.returnType == null
  ) {
    return false;
  }

  const { returnType } = owner;

  const references = flatMap(
    sourceCode.getDeclaredVariables(typeParameter),
    (variable) => {
      return variable.references;
    },
  );

  return references.some(({ identifier }) => {
    return (
      identifier.type === "Identifier" &&
      sourceCode.getAncestors(identifier).some((ancestor) => {
        return ancestor === returnType;
      })
    );
  });
}

export default defineConvention({
  delegates: [
    delegateRule("@typescript-eslint/no-unnecessary-type-parameters", [], {
      ignoreReport: isReturnTypeCast,
    }),
  ],
  typeAware: true,
  severity: "info",
});
