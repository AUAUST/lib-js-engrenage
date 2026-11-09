import { createExpressionStatementSelector } from "#tools/eslint/utils/createExpressionStatementSelector";
import { definePadding } from "#tools/eslint/utils/definePadding";

const statement = {
  selector: createExpressionStatementSelector("YieldExpression"),
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
