import { definePadding } from "#eslint/conventions/definePadding";

export default definePadding({
  message: "Separate the exports from the preceding code with a blank line.",
  paddings: [
    {
      blankLine: "always",
      prev: "*",
      next: "export",
    },
    {
      blankLine: "any",
      prev: "export",
      next: "export",
    },
  ],
});
