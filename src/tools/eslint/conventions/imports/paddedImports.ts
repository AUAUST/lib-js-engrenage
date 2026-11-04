import { definePadding } from "#eslint/conventions/definePadding";

export default definePadding({
  message: "Separate the imports from the following code with a blank line.",
  paddings: [
    {
      blankLine: "always",
      prev: "import",
      next: "*",
    },
    {
      blankLine: "any",
      prev: "import",
      next: "import",
    },
  ],
});
