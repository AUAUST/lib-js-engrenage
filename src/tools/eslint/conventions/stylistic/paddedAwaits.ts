import { definePadding } from "#tools/eslint/utils/definePadding";

const statement = {
  selector:
    ":matches(ExpressionStatement:has(> AwaitExpression), ExpressionStatement:has(> AssignmentExpression[right.type=AwaitExpression]), VariableDeclaration:has(> VariableDeclarator[init.type=AwaitExpression]), ExportNamedDeclaration:has(> VariableDeclaration:has(> VariableDeclarator[init.type=AwaitExpression])))",
};

export default definePadding({
  message: "Surround awaited statements and assignments with blank lines.",
  paddings: [
    {
      blankLine: "always",
      prev: "*",
      next: statement,
    },
    {
      blankLine: "always",
      prev: statement,
      next: "*",
    },
  ],
});
