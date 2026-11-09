import { definePadding } from "#tools/eslint/utils/definePadding";

const declarations = [
  "multiline-const",
  "multiline-let",
  "multiline-var",
  {
    selector: "ExportNamedDeclaration[declaration.type=VariableDeclaration]",
    lineMode: "multiline",
  },
] as const;

export default definePadding({
  message: "Surround multiline variable declarations with blank lines.",
  paddings: [
    {
      blankLine: "always",
      prev: [...declarations],
      next: "*",
    },
    {
      blankLine: "always",
      prev: "*",
      next: [...declarations],
    },
  ],
});
