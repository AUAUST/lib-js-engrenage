import { join } from "@auaust/primitive-kit/arrays";

import { definePadding } from "#tools/eslint/utils/definePadding";

const declarationTypes = [
  "ClassDeclaration",
  "FunctionDeclaration",
  "TSEnumDeclaration",
  "TSInterfaceDeclaration",
  "TSModuleDeclaration",
  "TSTypeAliasDeclaration",
];

const declarations = `:matches(${join(declarationTypes, ", ")})`;

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

const blockLevel = `:matches(${blocks}, ${declarations}, :matches(ExportNamedDeclaration, ExportDefaultDeclaration)[declaration.type=/^(${join(declarationTypes, "|")})$/])`;

const overload =
  ":matches(TSDeclareFunction, [declaration.type=TSDeclareFunction])";

const implementation =
  ":matches(FunctionDeclaration, [declaration.type=FunctionDeclaration])";

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
