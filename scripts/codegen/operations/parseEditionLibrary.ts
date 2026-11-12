import { readFile } from "node:fs/promises";
import { join as joinPath } from "node:path";

import {
  createSourceFile,
  isCallSignatureDeclaration,
  isComputedPropertyName,
  isConstructSignatureDeclaration,
  isFunctionDeclaration,
  isIdentifier,
  isInterfaceDeclaration,
  isModuleBlock,
  isModuleDeclaration,
  isNumericLiteral,
  isPropertyAccessExpression,
  isStringLiteral,
  isVariableStatement,
  ScriptTarget,
  type Node,
  type PropertyName,
  type Statement,
} from "typescript";

import { map } from "@auaust/primitive-kit/arrays";

import type { Library } from "#scripts/codegen/types/Library";
import type { LibraryDeclaration } from "#scripts/codegen/types/LibraryDeclaration";
import type { Directory } from "#types/Directory";

function readMemberName(name: PropertyName | undefined): string | undefined {
  if (name == null) {
    return;
  }

  if (isIdentifier(name) || isStringLiteral(name)) {
    return name.text;
  }

  if (
    isComputedPropertyName(name) &&
    isPropertyAccessExpression(name.expression) &&
    isIdentifier(name.expression.expression) &&
    name.expression.expression.text === "Symbol"
  ) {
    return `@@${name.expression.name.text}`;
  }
}

function collectDeclarations(
  statements: readonly Statement[],
  prefix: string,
  library: {
    declarations: LibraryDeclaration[];
    interfaces: Set<string>;
    values: Set<string>;
  },
  libraryName: string,
) {
  for (const statement of statements) {
    if (isInterfaceDeclaration(statement)) {
      const owner = `${prefix}${statement.name.text}`;

      library.interfaces.add(owner);

      for (const member of statement.members) {
        if (
          isCallSignatureDeclaration(member) ||
          isConstructSignatureDeclaration(member)
        ) {
          library.declarations.push({ type: "signature", owner });

          continue;
        }

        if (member.name == null || isNumericLiteral(member.name)) {
          continue;
        }

        const name = readMemberName(member.name);

        if (name === undefined) {
          throw new Error(
            `lib.${libraryName}.d.ts declares ${owner} with a member name that is neither an identifier nor [Symbol.<name>]`,
          );
        }

        library.declarations.push({
          type: "member",
          owner,
          name,
        });
      }
    } else if (isVariableStatement(statement)) {
      for (const { name } of statement.declarationList.declarations) {
        if (!isIdentifier(name)) {
          continue;
        }

        library.values.add(`${prefix}${name.text}`);

        library.declarations.push({
          type: "value",
          name: `${prefix}${name.text}`,
        });
      }
    } else if (isFunctionDeclaration(statement) && statement.name != null) {
      library.values.add(`${prefix}${statement.name.text}`);

      library.declarations.push({
        type: "value",
        name: `${prefix}${statement.name.text}`,
      });
    } else if (isModuleDeclaration(statement) && statement.body != null) {
      const name = isIdentifier(statement.name) ? statement.name.text : "";

      const inner = name === "global" ? prefix : `${prefix}${name}.`;
      const body: Node = statement.body;

      collectDeclarations(
        isModuleBlock(body)
          ? body.statements
          : isModuleDeclaration(body)
            ? [body]
            : [],
        inner,
        library,
        libraryName,
      );
    }
  }
}

export async function parseEditionLibrary(
  directory: Directory,
  name: string,
): Promise<Library> {
  const source = createSourceFile(
    `lib.${name}.d.ts`,
    await readFile(joinPath(directory, `lib.${name}.d.ts`), "utf-8"),
    ScriptTarget.ESNext,
    true,
  );

  const library = {
    declarations: [] as LibraryDeclaration[],
    interfaces: new Set<string>(),
    values: new Set<string>(),
  };

  collectDeclarations(source.statements, "", library, name);

  return {
    name,
    references: map(source.libReferenceDirectives, ({ fileName }) => fileName),
    ...library,
  };
}
