import { definePadding } from "#eslint/conventions/definePadding";

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
