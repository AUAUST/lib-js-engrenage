import type { Rule } from "eslint";

import { isString } from "@auaust/toolkit/isString";

export function visitImportSources(
  visit: (node: Rule.Node, source: string) => void,
): Rule.RuleListener {
  function check(node: Rule.Node, source: unknown) {
    if (isString(source)) {
      visit(node, source);
    }
  }

  return {
    ImportDeclaration(node) {
      check(node, node.source.value);
    },
    ExportAllDeclaration(node) {
      check(node, node.source.value);
    },
    ExportNamedDeclaration(node) {
      check(node, node.source?.value);
    },
    ImportExpression(node) {
      if (node.source.type === "Literal") {
        check(node, node.source.value);
      }
    },
  };
}
