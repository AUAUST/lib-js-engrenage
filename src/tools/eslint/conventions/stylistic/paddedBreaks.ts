import { definePadding } from "#tools/eslint/utils/definePadding";

const statement = {
  selector: "BreakStatement",
};

export default definePadding({
  message: "Surround `break` statements with blank lines.",
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
