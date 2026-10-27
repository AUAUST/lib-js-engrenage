import { definePadding } from "#eslint/conventions/definePadding";

export default definePadding({
  message:
    "Separate a `case` that has statements from the next `case` with a blank line.",
  paddings: [
    {
      blankLine: "always",
      prev: {
        selector: "SwitchCase[consequent.length>0]",
      },
      next: ["case", "default"],
    },
  ],
});
