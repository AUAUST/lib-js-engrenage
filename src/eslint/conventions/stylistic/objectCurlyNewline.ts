import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("@stylistic/object-curly-newline", [
      {
        ObjectExpression: {
          minProperties: 1,
        },
        ObjectPattern: {
          consistent: true,
        },
        ImportDeclaration: {
          consistent: true,
        },
        ExportDeclaration: {
          consistent: true,
        },
        TSTypeLiteral: {
          consistent: true,
        },
        TSInterfaceBody: {
          consistent: true,
        },
      },
    ]),
  ],
});
