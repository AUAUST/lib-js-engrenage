import { definePadding } from "#eslint/conventions/definePadding";

export default definePadding({
  message:
    "Separate variable declarations from other statements with blank lines, except declarations of the same kind.",
  paddings: [
    {
      blankLine: "always",
      prev: "*",
      next: ["const", "let", "var"],
    },
    {
      blankLine: "always",
      prev: ["const", "let", "var"],
      next: "*",
    },
    {
      blankLine: "any",
      prev: "const",
      next: "const",
    },
    {
      blankLine: "any",
      prev: "let",
      next: "let",
    },
    {
      blankLine: "any",
      prev: "var",
      next: "var",
    },
  ],
});
