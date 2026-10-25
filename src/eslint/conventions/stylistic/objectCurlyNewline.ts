import { defineConvention } from "#eslint/conventions/defineConvention";

export default defineConvention({
  rules: {
    "@stylistic/object-curly-newline": [
      "error",
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
    ],
  },
});
