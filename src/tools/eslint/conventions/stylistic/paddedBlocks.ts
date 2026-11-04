import { join } from "@auaust/primitive-kit/arrays";

import { definePadding } from "#eslint/conventions/definePadding";

const declarations = `:matches(${join(
  [
    "ClassDeclaration",
    "FunctionDeclaration",
    "TSEnumDeclaration",
    "TSInterfaceDeclaration",
    "TSModuleDeclaration",
    "TSTypeAliasDeclaration",
  ],
  ", ",
)})`;

const blocks = `:matches(${join(
  [
    "BlockStatement",
    "DoWhileStatement",
    "ForInStatement",
    "ForOfStatement",
    "ForStatement",
    "IfStatement",
    "SwitchStatement",
    "TryStatement",
    "WhileStatement",
    "WithStatement",
  ],
  ", ",
)})`;

const blockLevel = `:matches(${blocks}, ${declarations}, :matches(ExportNamedDeclaration, ExportDefaultDeclaration):has(> ${declarations}))`;

const overload = ":matches(TSDeclareFunction, :has(> TSDeclareFunction))";

const implementation =
  ":matches(FunctionDeclaration, :has(> FunctionDeclaration))";

const statement = ":matches(:statement, TSDeclareFunction)";

export default definePadding({
  message:
    "Surround types, interfaces, functions, classes, enums, namespaces and block statements with blank lines.",
  paddings: [
    {
      blankLine: "always",
      prev: {
        selector: statement,
      },
      next: {
        selector: `${blockLevel}:not(${overload} + ${implementation})`,
      },
    },
    {
      blankLine: "always",
      prev: {
        selector: blockLevel,
      },
      next: {
        selector: statement,
      },
    },
  ],
});
