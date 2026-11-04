import { definePadding } from "#eslint/conventions/definePadding";

const declarations = [
  "multiline-const",
  "multiline-let",
  "multiline-var",
  {
    selector: "ExportNamedDeclaration:has(> VariableDeclaration)",
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
