import { createRuleMeta } from "#tools/eslint/utils/createRuleMeta";
import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { isTypeOnlyNode } from "#tools/eslint/utils/isTypeOnlyNode";

export default defineConvention({
  files: ["files.code.published", "files.scripts"],
  rule: {
    meta: createRuleMeta({
      description: "A dynamic import() never targets a module its file already imports statically.",
      messages: {
        imported: "`{{specifier}}` is already imported statically; use that binding.",
      },
    }),
    create(context) {
      // @debt reports only modules this file imports directly, while a target reachable through its static graph is just as pointless
      const staticSources = new Set(
        context.sourceCode.ast.body.flatMap((statement) => {
          return statement.type === "ImportDeclaration" &&
            !isTypeOnlyNode(statement)
            ? [statement.source.value]
            : [];
        }),
      );

      return {
        ImportExpression(node) {
          if (
            node.source.type === "Literal" &&
            staticSources.has(node.source.value)
          ) {
            context.report({
              node,
              messageId: "imported",
              data: { specifier: String(node.source.value) },
            });
          }
        },
      };
    },
  },
});
