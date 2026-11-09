import { join } from "@auaust/primitive-kit/arrays";

// @debt declarations of several declarators still match through `:has`, which esquery evaluates by walking the whole subtree, and no test bounds selector cost
export function createExpressionStatementSelector(type: string): string {
  const declarator = `VariableDeclarator[init.type=${type}]`;

  return `:matches(${join(
    [
      `ExpressionStatement[expression.type=${type}]`,
      `ExpressionStatement[expression.type=AssignmentExpression][expression.right.type=${type}]`,
      `VariableDeclaration[declarations.0.init.type=${type}]`,
      `VariableDeclaration[declarations.length>1]:has(> ${declarator})`,
      `ExportNamedDeclaration[declaration.declarations.0.init.type=${type}]`,
      `ExportNamedDeclaration[declaration.declarations.length>1]:has(> VariableDeclaration:has(> ${declarator}))`,
    ],
    ", ",
  )})`;
}
