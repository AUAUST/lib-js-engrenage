import { importType } from "eslint-plugin-import-x/utils";
import type { Rule } from "eslint";
import type { RuleContext as ImportContext } from "eslint-plugin-import-x";

import { isString } from "@auaust/toolkit/isString";

import { defineConvention } from "#eslint/conventions/defineConvention";

const projectImportTypes = new Set([
  "absolute",
  "index",
  "internal",
  "parent",
  "sibling",
]);

export default defineConvention({
  rule: {
    meta: {
      type: "problem",
      docs: {
        description:
          "Namespace imports and exports are reserved for project modules.",
      },
      messages: {
        external:
          "Import named bindings from `{{ source }}`; namespace imports and exports are reserved for project modules.",
      },
      schema: [],
    },
    create(context) {
      function check(node: Rule.Node, source: unknown) {
        if (
          !isString(source) ||
          projectImportTypes.has(
            // import-x rules receive this same ESLint context at runtime; only their typings differ.
            importType(source, context as unknown as ImportContext),
          )
        ) {
          return;
        }

        context.report({
          node,
          messageId: "external",
          data: {
            source,
          },
        });
      }

      return {
        ImportDeclaration(node) {
          for (const specifier of node.specifiers) {
            if (specifier.type === "ImportNamespaceSpecifier") {
              check(node, node.source.value);
            }
          }
        },
        ExportAllDeclaration(node) {
          if (node.exported != null) {
            check(node, node.source.value);
          }
        },
      };
    },
  },
});
