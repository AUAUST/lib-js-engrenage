import { definePadding } from "#tools/eslint/utils/definePadding";

export default definePadding({
  message: "Add a blank line before a `throw` that follows other statements.",
  paddings: [
    {
      blankLine: "always",
      prev: "*",
      next: "throw",
    },
  ],
});
