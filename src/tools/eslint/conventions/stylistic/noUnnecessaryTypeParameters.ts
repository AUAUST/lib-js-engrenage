import {
  isConditionalType,
  isIndexedAccessType,
  isIndexType,
  isObjectType,
  isSubstitutionType,
  isTemplateLiteralType,
  isTypeReference,
  isUnionOrIntersectionType,
} from "ts-api-utils";
import {
  isFunctionLike,
  isTypeParameterDeclaration,
  type Signature,
  type Type,
  type TypeChecker,
} from "typescript";
import type { Rule, SourceCode } from "eslint";

import { last } from "@auaust/primitive-kit/arrays";

import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";
import type { ReportDescriptor } from "#tools/eslint/types/ReportDescriptor";

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

// @debt this walk mirrors the upstream rule's usage count only to look through `NoInfer`, which upstream does not unwrap; an upstream fix would let the rule ignore return-type uses without its own walk
function containsType(
  checker: TypeChecker,
  type: Type | undefined,
  target: Type,
  visited = new Set<Type>(),
): boolean {
  if (type === undefined || visited.has(type)) {
    return false;
  }

  visited.add(type);

  function contains(member: Type | undefined): boolean {
    return containsType(checker, member, target, visited);
  }

  function signatureContains(signature: Signature): boolean {
    return (
      signature.parameters.some((parameter) => {
        return contains(checker.getTypeOfSymbol(parameter));
      }) || contains(signature.getReturnType())
    );
  }

  if (type === target || type.aliasTypeArguments?.some(contains) === true) {
    return true;
  }

  if (isSubstitutionType(type)) {
    return contains(type.baseType);
  }

  if (isUnionOrIntersectionType(type) || isTemplateLiteralType(type)) {
    return type.types.some(contains);
  }

  if (isIndexedAccessType(type)) {
    return contains(type.objectType) || contains(type.indexType);
  }

  if (isConditionalType(type)) {
    return contains(type.checkType) || contains(type.extendsType);
  }

  if (isIndexType(type)) {
    return contains(type.type);
  }

  if (isTypeReference(type)) {
    return checker.getTypeArguments(type).some(contains);
  }

  return (
    isObjectType(type) &&
    (checker.getPropertiesOfType(type).some((property) => {
      return contains(checker.getTypeOfSymbol(property));
    }) ||
      checker.getIndexInfosOfType(type).some((info) => {
        return contains(info.type);
      }) ||
      type.getCallSignatures().some(signatureContains) ||
      type.getConstructSignatures().some(signatureContains))
  );
}

function isUsedInReturnType(
  descriptor: ReportDescriptor,
  { sourceCode }: Rule.RuleContext,
): boolean {
  const typeParameter = findTypeParameter(sourceCode, descriptor);

  const { program, esTreeNodeToTSNodeMap } = sourceCode.parserServices;

  if (
    typeParameter === undefined ||
    program == null ||
    esTreeNodeToTSNodeMap == null
  ) {
    return false;
  }

  const declaration = esTreeNodeToTSNodeMap.get(typeParameter);

  if (
    !isTypeParameterDeclaration(declaration) ||
    !isFunctionLike(declaration.parent)
  ) {
    return false;
  }

  const checker: TypeChecker = program.getTypeChecker();

  return containsType(
    checker,
    checker.getSignatureFromDeclaration(declaration.parent)?.getReturnType(),
    checker.getTypeAtLocation(declaration),
  );
}

export default defineConvention({
  delegates: [
    delegateRule("@typescript-eslint/no-unnecessary-type-parameters", [], {
      ignoreReport: isUsedInReturnType,
    }),
  ],
  typeAware: true,
  severity: "info",
});
