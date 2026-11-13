import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/types";

type SignatureNode =
  | TSESTree.FunctionLike
  | TSESTree.TSMethodSignature
  | TSESTree.TSCallSignatureDeclaration
  | TSESTree.TSConstructSignatureDeclaration
  | TSESTree.TSFunctionType;

type GenericDeclaration =
  | TSESTree.ClassDeclaration
  | TSESTree.TSInterfaceDeclaration
  | TSESTree.TSTypeAliasDeclaration;

const signatureTypes: ReadonlySet<string> = new Set([
  AST_NODE_TYPES.FunctionDeclaration,
  AST_NODE_TYPES.TSDeclareFunction,
  AST_NODE_TYPES.FunctionExpression,
  AST_NODE_TYPES.ArrowFunctionExpression,
  AST_NODE_TYPES.TSEmptyBodyFunctionExpression,
  AST_NODE_TYPES.TSMethodSignature,
  AST_NODE_TYPES.TSCallSignatureDeclaration,
  AST_NODE_TYPES.TSConstructSignatureDeclaration,
  AST_NODE_TYPES.TSFunctionType,
]);

const genericTypes: ReadonlySet<string> = new Set([
  AST_NODE_TYPES.ClassDeclaration,
  AST_NODE_TYPES.TSInterfaceDeclaration,
  AST_NODE_TYPES.TSTypeAliasDeclaration,
]);

const expressionTypes: ReadonlySet<string> = new Set([
  AST_NODE_TYPES.FunctionExpression,
  AST_NODE_TYPES.ArrowFunctionExpression,
  AST_NODE_TYPES.TSEmptyBodyFunctionExpression,
  AST_NODE_TYPES.TSFunctionType,
]);

const memberTypes: ReadonlySet<string> = new Set([
  AST_NODE_TYPES.MethodDefinition,
  AST_NODE_TYPES.TSAbstractMethodDefinition,
  AST_NODE_TYPES.Property,
  AST_NODE_TYPES.PropertyDefinition,
  AST_NODE_TYPES.TSTypeAliasDeclaration,
]);

function isSignature(node: TSESTree.Node): node is SignatureNode {
  return signatureTypes.has(node.type);
}

function isGenericDeclaration(node: TSESTree.Node): node is GenericDeclaration {
  return genericTypes.has(node.type);
}

function findExpressionHolder(
  parent: TSESTree.Node | undefined,
): TSESTree.Node | undefined {
  if (parent === undefined || memberTypes.has(parent.type)) {
    return parent;
  }

  if (parent.type === AST_NODE_TYPES.TSTypeAnnotation) {
    return parent.parent.type === AST_NODE_TYPES.TSPropertySignature
      ? parent.parent
      : undefined;
  }

  if (parent.type === AST_NODE_TYPES.VariableDeclarator) {
    return parent.parent.declarations.length === 1 ? parent.parent : undefined;
  }
}

function findHolder(node: TSESTree.Node): TSESTree.Node | undefined {
  const holder = expressionTypes.has(node.type)
    ? findExpressionHolder(node.parent)
    : node;

  return holder?.parent?.type === AST_NODE_TYPES.ExportNamedDeclaration ||
    holder?.parent?.type === AST_NODE_TYPES.ExportDefaultDeclaration
    ? holder.parent
    : holder;
}

function readParameterName(parameter: TSESTree.Parameter): string | undefined {
  const target = parameter.type === AST_NODE_TYPES.TSParameterProperty
    ? parameter.parameter
    : parameter;

  const named = target.type === AST_NODE_TYPES.AssignmentPattern
    ? target.left
    : target.type === AST_NODE_TYPES.RestElement
      ? target.argument
      : target;

  return named.type === AST_NODE_TYPES.Identifier ? named.name : undefined;
}

function readNames(node: TSESTree.Node): {
  readonly parameters: readonly TSESTree.Parameter[];
  readonly typeParameters: readonly string[];
} {
  const typeParameters = (
    isSignature(node) || isGenericDeclaration(node)
      ? (node.typeParameters?.params ?? [])
      : []
  ).map(({ name }) => name.name);

  if (
    node.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
    node.typeAnnotation.type === AST_NODE_TYPES.TSFunctionType
  ) {
    const inner = readNames(node.typeAnnotation);

    return {
      parameters: inner.parameters,
      typeParameters: [...typeParameters, ...inner.typeParameters],
    };
  }

  return { parameters: isSignature(node) ? node.params : [], typeParameters };
}

export function readDocumentedSignature(node: TSESTree.Node):
  | {
      readonly holder: TSESTree.Node;
      readonly parameters: readonly string[] | undefined;
      readonly typeParameters: readonly string[];
    }
  | undefined {
  const holder = findHolder(node);

  if (holder === undefined) {
    return;
  }

  const { parameters, typeParameters } = readNames(node);

  const names = parameters.map(readParameterName);

  return {
    holder,
    parameters: names.includes(undefined)
      ? undefined
      : names.filter((name) => name !== undefined),
    typeParameters,
  };
}
