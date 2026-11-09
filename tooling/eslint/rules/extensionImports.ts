import { realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { basename, dirname, join, sep } from "node:path";

import type { Rule } from "eslint";

import { isObject } from "@auaust/toolkit/isObject";

import {
  defineRoleRule,
  isTypeOnlyNode,
  visitImportSources,
} from "#tools/eslint/index";
import type { File } from "#types/File";

function resolveSpecifier(from: File, specifier: string): File | undefined {
  try {
    return createRequire(from).resolve(specifier);
  } catch (error) {
    if (
      isObject(error) &&
      "code" in error &&
      error.code === "MODULE_NOT_FOUND"
    ) {
      return;
    }

    throw error;
  }
}

export const extensionImports = defineRoleRule({
  description:
    "An extension imports statically only types, its domain's constants and its sub-domains' extensions, and loads only its own domain's modules.",
  messages: {
    staticImport:
      "An extension imports statically only types and its domain's `constants.ts`; load `{{specifier}}` behind `import()`.",
    foreignImport:
      "An extension loads only modules of its own domain; `{{specifier}}` is outside it.",
    dynamicSource: "An extension loads only literal specifiers.",
  },
  create(context) {
    const directory = realpathSync(dirname(context.filename));

    function isStaticallyAllowed(file: File | undefined): boolean {
      return (
        file === join(directory, "constants.ts") ||
        (basename(file ?? "") === "extension.ts" &&
          dirname(dirname(file ?? "")) === directory)
      );
    }

    function isInside(file: File | undefined): boolean {
      return file?.startsWith(`${directory}${sep}`) === true;
    }

    const sources = visitImportSources((node, specifier) => {
      const file = resolveSpecifier(context.filename, specifier);

      if (node.type === "ImportExpression") {
        if (!isInside(file)) {
          context.report({
            node,
            messageId: "foreignImport",
            data: { specifier },
          });
        }

        return;
      }

      if (!isTypeOnlyNode(node) && !isStaticallyAllowed(file)) {
        context.report({
          node,
          messageId: "staticImport",
          data: { specifier },
        });
      }
    });

    return {
      ...sources,
      ImportExpression(node: Rule.Node & { type: "ImportExpression" }) {
        if (node.source.type === "Literal") {
          sources.ImportExpression?.(node);
        } else {
          context.report({ node, messageId: "dynamicSource" });
        }
      },
    };
  },
});
