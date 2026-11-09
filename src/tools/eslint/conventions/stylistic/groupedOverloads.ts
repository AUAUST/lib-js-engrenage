import { definePadding } from "#tools/eslint/utils/definePadding";

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
          selector: `${exported}[declaration.type=TSDeclareFunction]`,
        },
      ],
      next: [
        "function-overload",
        {
          selector: `:matches(FunctionDeclaration, ${exported}[declaration.type=/^(TSDeclareFunction|FunctionDeclaration)$/])`,
        },
      ],
    },
  ],
});
