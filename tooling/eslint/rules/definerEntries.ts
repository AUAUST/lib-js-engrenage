import { readFileSync } from "node:fs";
import { basename, extname, resolve } from "node:path";

import {
  createSourceFile,
  isClassDeclaration,
  isExportDeclaration,
  isFunctionDeclaration,
  isIdentifier,
  isNamedExports,
  isVariableStatement,
  ScriptTarget,
  SyntaxKind,
  type Statement,
} from "typescript";

import { memoized } from "@auaust/toolkit/memoized";

import { defineRoleRule } from "#tools/eslint/index";
import type { File } from "#types/File";

function isExported(statement: Statement) {
  return (
    (isVariableStatement(statement) ||
      isFunctionDeclaration(statement) ||
      isClassDeclaration(statement)) &&
    statement.modifiers?.some(
      ({ kind }) => kind === SyntaxKind.ExportKeyword,
    ) === true
  );
}

function namesOf(statement: Statement): string[] {
  if (isExportDeclaration(statement)) {
    return statement.isTypeOnly ||
      statement.exportClause === undefined ||
      !isNamedExports(statement.exportClause)
      ? []
      : statement.exportClause.elements
          .filter((element) => !element.isTypeOnly)
          .map((element) => element.name.text);
  }

  if (!isExported(statement)) {
    return [];
  }

  if (isVariableStatement(statement)) {
    return statement.declarationList.declarations.flatMap(({ name }) => {
      return isIdentifier(name) ? [name.text] : [];
    });
  }

  return isFunctionDeclaration(statement) || isClassDeclaration(statement)
    ? [statement.name?.text ?? ""]
    : [];
}

// @debt memoized for the process, not the lint run: a long-lived ESLint (an editor server) keeps an entry's first reading after it changes
const readEntryExports = memoized(
  (entry: File): ReadonlySet<string> | undefined => {
    let text: string;

    try {
      text = readFileSync(entry, "utf-8");
    } catch {
      return;
    }

    const source = createSourceFile(entry, text, ScriptTarget.Latest);

    return new Set(source.statements.flatMap(namesOf));
  },
);

export const definerEntries = defineRoleRule({
  description: "A domain's definer is exported from the domain's entry.",
  messages: {
    missingEntry: "Add the entry `{{entry}}` exporting `{{name}}`.",
    notExported: "Export `{{name}}` from the entry `{{entry}}`.",
  },
  create(context, entity, { entryFile }) {
    const domain = entity.lineage.findLast(({ kind }) => kind === "domain");

    if (entryFile === undefined || domain === undefined) {
      return {};
    }

    const name = basename(context.filename, extname(context.filename));
    const entry = resolve(context.cwd, domain.path, entryFile);

    return {
      Program(node) {
        const exported = readEntryExports(entry);

        if (exported?.has(name) !== true) {
          context.report({
            node,
            messageId: exported === undefined ? "missingEntry" : "notExported",
            data: { name, entry: `${domain.path}/${entryFile}` },
          });
        }
      },
    };
  },
});
