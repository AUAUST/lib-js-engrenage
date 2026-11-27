import { freeze } from "@auaust/toolkit/object";

export const functionNodeTypes: readonly string[] = freeze([
  "FunctionDeclaration",
  "FunctionExpression",
  "ArrowFunctionExpression",
]);

export const classNodeTypes: readonly string[] = freeze([
  "ClassDeclaration",
  "ClassExpression",
]);
