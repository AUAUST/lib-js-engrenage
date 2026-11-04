import { definePadding } from "#tools/eslint/utils/definePadding";

export default definePadding({
  message: "Surround multiline expression statements with blank lines.",
  paddings: [
    {
      blankLine: "always",
      prev: "multiline-expression",
      next: "*",
    },
    {
      blankLine: "always",
      prev: "*",
      next: "multiline-expression",
    },
  ],
});
