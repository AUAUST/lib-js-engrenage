import { compileFunction } from "node:vm";

import type { Rule, Scope, SourceCode } from "eslint";

import { includes, join, last, map } from "@auaust/primitive-kit/arrays";
import {
  split,
  toCamelCase,
  toLowerCase,
  toPascalCase,
} from "@auaust/primitive-kit/strings";
import { isString } from "@auaust/toolkit/isString";

import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";
import type { ReportDescriptor } from "#eslint/types/ReportDescriptor";

const formatMessages = ["doesNotMatchFormat", "doesNotMatchFormatTrimmed"];

const unsafeScopeTypes = new Set(["global", "tsModule"]);

function convertName(name: string, formats: readonly string[]) {
  if (!/^[A-Za-z\d_]+$/.test(name)) {
    return;
  }

  const words = join(
    map(split(name, "_"), (word) => {
      return /[a-z]/.test(word) ? word : toLowerCase(word);
    }),
    "_",
  );

  if (includes(formats, "PascalCase") && /^[A-Z][a-z]/.test(name)) {
    return toPascalCase(words);
  }

  if (includes(formats, "camelCase")) {
    return toCamelCase(words);
  }

  if (includes(formats, "PascalCase")) {
    return toPascalCase(words);
  }
}

function isBindingName(name: string) {
  if (!/^[A-Za-z_$][\w$]*$/.test(name)) {
    return false;
  }

  try {
    compileFunction(`"use strict"; async function* binding() { let ${name}; }`);

    return true;
  } catch {
    return false;
  }
}

function findVariables(
  sourceCode: SourceCode,
  node: Scope.Variable["identifiers"][number],
) {
  const variables: Scope.Variable[] = [];

  for (
    let scope: Scope.Scope | null = sourceCode.getScope(node);
    scope !== null;
    scope = scope.upper
  ) {
    const variable = scope.set.get(node.name);

    if (variable?.identifiers.includes(node) === true) {
      variables.push(variable);
    }
  }

  return variables;
}

function isExportedDeclaration(
  sourceCode: SourceCode,
  definition: Scope.Definition,
) {
  const declaration = definition.parent ?? definition.node;

  return last(sourceCode.getAncestors(declaration))?.type.startsWith("Export");
}

function declaresName(scope: Scope.Scope, name: string): boolean {
  return (
    scope.set.has(name) ||
    scope.childScopes.some((child) => {
      return declaresName(child, name);
    })
  );
}

function isRenameSafe(
  sourceCode: SourceCode,
  variables: readonly Scope.Variable[],
  name: string,
) {
  return (
    variables.length > 0 &&
    !variables.some(({ scope, defs }) => {
      return (
        unsafeScopeTypes.has(scope.type) ||
        defs.some((definition) => {
          return isExportedDeclaration(sourceCode, definition);
        }) ||
        declaresName(scope, name) ||
        scope.through.some((reference) => {
          return reference.identifier.name === name;
        })
      );
    })
  );
}

function renamedText(
  sourceCode: SourceCode,
  identifier: Scope.Variable["identifiers"][number],
  from: string,
  to: string,
) {
  const ancestors = sourceCode.getAncestors(identifier);

  const parent = last(ancestors);

  const property =
    parent?.type === "AssignmentPattern" && parent.left === identifier
      ? ancestors.at(-2)
      : parent;

  if (property?.type === "Property" && property.shorthand) {
    return `${from}: ${to}`;
  }

  if (
    parent?.type === "ImportSpecifier" &&
    sourceCode.getText(parent) === from
  ) {
    return `${from} as ${to}`;
  }

  if (
    parent?.type === "ExportSpecifier" &&
    sourceCode.getText(parent) === from
  ) {
    return `${to} as ${from}`;
  }

  return to;
}

function fixFormat(
  descriptor: ReportDescriptor,
  context: Rule.RuleContext,
): Rule.ReportFixer | null {
  if (
    !("node" in descriptor) ||
    descriptor.node.loc == null ||
    !("messageId" in descriptor) ||
    !includes(formatMessages, descriptor.messageId) ||
    !isString(descriptor.data?.name) ||
    !isString(descriptor.data.processedName) ||
    !isString(descriptor.data.formats)
  ) {
    return null;
  }

  const { sourceCode } = context;

  const node = sourceCode.getNodeByRangeIndex(
    sourceCode.getIndexFromLoc(descriptor.node.loc.start),
  );

  if (node?.type !== "Identifier") {
    return null;
  }

  const { name, processedName, formats } = descriptor.data;

  const parts = split(name, processedName);

  const converted = convertName(processedName, split(formats, ", "));

  if (parts.length !== 2 || converted === undefined) {
    return null;
  }

  const newName = join(parts, converted);

  const variables = findVariables(sourceCode, node);

  if (
    !isBindingName(newName) ||
    !isRenameSafe(sourceCode, variables, newName)
  ) {
    return null;
  }

  const identifiers = new Set<Scope.Reference["identifier"]>();

  for (const variable of variables) {
    for (const identifier of variable.identifiers) {
      identifiers.add(identifier);
    }

    for (const reference of variable.references) {
      identifiers.add(reference.identifier);
    }
  }

  return (fixer) => {
    return map([...identifiers], (identifier) => {
      return identifier.type === "JSXIdentifier"
        ? fixer.replaceText(identifier, newName)
        : fixer.replaceText(
            identifier,
            renamedText(sourceCode, identifier, name, newName),
          );
    });
  };
}

export default defineConvention({
  delegates: [
    delegateRule(
      "@typescript-eslint/naming-convention",
      [
        {
          selector: ["variable", "function"],
          format: ["camelCase", "PascalCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "variable",
          filter: {
            regex: "^__.+__$",
            match: true,
          },
          format: ["UPPER_CASE"],
          leadingUnderscore: "requireDouble",
          trailingUnderscore: "requireDouble",
        },
        {
          selector: "variable",
          modifiers: ["destructured"],
          format: null,
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
      ],
      {
        fix: fixFormat,
      },
    ),
  ],
  severity: "info",
});
