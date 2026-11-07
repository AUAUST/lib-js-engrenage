import { definePadding } from "#tools/eslint/utils/definePadding";

const statement = {
  selector:
    ":matches(ExpressionStatement:has(> YieldExpression), ExpressionStatement:has(> AssignmentExpression[right.type=YieldExpression]), VariableDeclaration:has(> VariableDeclarator[init.type=YieldExpression]))",
};

export default definePadding({
  message: "Surround yield statements and assignments with blank lines.",
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
