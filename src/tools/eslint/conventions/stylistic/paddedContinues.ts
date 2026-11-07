import { definePadding } from "#tools/eslint/utils/definePadding";

const statement = {
  selector: "ContinueStatement",
};

export default definePadding({
  message: "Surround `continue` statements with blank lines.",
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
