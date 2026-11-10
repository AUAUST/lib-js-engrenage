import { printers } from "prettier/plugins/estree";
import type { AstPath, Doc, Printer } from "prettier";

import { findLast } from "@auaust/primitive-kit/arrays";

import { printAssignedConditional } from "#tools/prettier/utils/printAssignedConditional";
import { printAssignment } from "#tools/prettier/utils/printAssignment";
import { printConditional } from "#tools/prettier/utils/printConditional";
import type { AstNode } from "#tools/prettier/types/AstNode";
import type { Plugin } from "#tools/prettier/types/Plugin";

const rightKeys = new Map([
  ["VariableDeclarator", "init"],
  ["AssignmentExpression", "right"],
  ["Property", "value"],
  ["ObjectProperty", "value"],
  ["PropertyDefinition", "value"],
  ["TSAbstractPropertyDefinition", "value"],
  ["AccessorProperty", "value"],
  ["TSAbstractAccessorProperty", "value"],
  ["ClassProperty", "value"],
  ["ClassPrivateProperty", "value"],
  ["ClassAccessorProperty", "value"],
  ["TSTypeAliasDeclaration", "typeAnnotation"],
]);

function isRightSide(path: AstPath<AstNode>): boolean {
  const { parent, key } = path;

  const parentRight = parent == null ? undefined : rightKeys.get(parent.type);

  return key != null && parentRight === key;
}

function printNode(
  base: Printer<AstNode>,
  ...[path, options, print, args]: Parameters<Printer<AstNode>["print"]>
): Doc {
  if (rightKeys.has(path.node.type)) {
    return printAssignment(path, options, print, args, base);
  }

  if (path.node.type !== "ConditionalExpression") {
    return base.print(path, options, print, args);
  }

  const conditionalBase: Printer<AstNode> = isRightSide(path)
    ? {
        ...base,
        print(...printArguments) {
          return printAssignedConditional(...printArguments, base);
        },
      }
    : base;

  return printConditional(path, options, print, args, conditionalBase);
}

export function createPrinterPlugin(plugins: readonly Plugin[]): Plugin {
  const base: Printer<AstNode> = (
    findLast(plugins, (plugin) => {
      return plugin.printers?.estree !== undefined;
    })?.printers?.estree ?? printers.estree
  );

  const printer: Printer<AstNode> = {
    ...base,
    print(...printArguments) {
      return printNode(base, ...printArguments);
    },
  };

  return {
    printers: {
      estree: printer,
    },
  };
}
