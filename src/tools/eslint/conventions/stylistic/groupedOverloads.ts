import { definePadding } from "#eslint/conventions/definePadding";

const exported = ":matches(ExportNamedDeclaration, ExportDefaultDeclaration)";

export default definePadding({
  message:
    "Keep function overloads and their implementation together, without blank lines.",
  paddings: [
    {
      blankLine: "never",
      prev: [
        "function-overload",
        {
          selector: `${exported}:has(> TSDeclareFunction)`,
        },
      ],
      next: [
        "function-overload",
        {
          selector: `:matches(FunctionDeclaration, ${exported}:has(> :matches(TSDeclareFunction, FunctionDeclaration)))`,
        },
      ],
    },
  ],
});
