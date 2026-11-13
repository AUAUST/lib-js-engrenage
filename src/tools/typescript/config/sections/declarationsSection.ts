import {
  canHaveModifiers,
  createSourceFile,
  getLeadingCommentRanges,
  getModifiers,
  isArrayBindingPattern,
  isClassDeclaration,
  isEnumDeclaration,
  isExportAssignment,
  isExportDeclaration,
  isFunctionDeclaration,
  isIdentifier,
  isInterfaceDeclaration,
  isNamedExports,
  isOmittedExpression,
  isTypeAliasDeclaration,
  isVariableStatement,
  ScriptTarget,
  SyntaxKind,
  type BindingName,
  type ClassDeclaration,
  type EnumDeclaration,
  type FunctionDeclaration,
  type InterfaceDeclaration,
  type Statement,
  type TypeAliasDeclaration,
} from "typescript";

import { isNotEmpty } from "@auaust/primitive-kit/arrays";
import { freeze } from "@auaust/toolkit/object";

import { isJsdocComment, parseJsdoc } from "#foundation/jsdoc/index";
import { declareSection } from "#foundation/options/index";
import {
  readDocTag,
  type Declarations,
  type DocSignature,
  type DocTag,
  type SourceDeclaration,
  type TagDeclaration,
} from "#project/docs/index";
import type { ConfigResolver } from "#project/config/index";
import type { File } from "#types/File";

type NamedStatement =
  | FunctionDeclaration
  | ClassDeclaration
  | TypeAliasDeclaration
  | InterfaceDeclaration
  | EnumDeclaration;

interface DocumentedBlock {
  readonly signature: DocSignature;
  readonly exported: readonly DocTag[];
}

interface Local {
  readonly kind: SourceDeclaration["kind"];
  readonly names: readonly string[];
  readonly statements: Statement[];
}

interface Locals {
  readonly byName: ReadonlyMap<string, readonly Local[]>;
  readonly byStatement: ReadonlyMap<Statement, readonly Local[]>;
}

function hasModifier(statement: Statement, modifier: SyntaxKind): boolean {
  return (
    canHaveModifiers(statement) &&
    (getModifiers(statement)?.some(({ kind }) => kind === modifier) ?? false)
  );
}

function isExported(statement: Statement): boolean {
  return hasModifier(statement, SyntaxKind.ExportKeyword);
}

function isNamedStatement(statement: Statement): statement is NamedStatement {
  return (
    isFunctionDeclaration(statement) ||
    isClassDeclaration(statement) ||
    isTypeAliasDeclaration(statement) ||
    isInterfaceDeclaration(statement) ||
    isEnumDeclaration(statement)
  );
}

function kindOf(statement: NamedStatement): SourceDeclaration["kind"] {
  if (isFunctionDeclaration(statement)) {
    return "function";
  }

  if (isClassDeclaration(statement)) {
    return "class";
  }

  if (isTypeAliasDeclaration(statement)) {
    return "type";
  }

  return isInterfaceDeclaration(statement) ? "interface" : "enum";
}

function bindingNames(name: BindingName): string[] {
  if (isIdentifier(name)) {
    return [name.text];
  }

  if (isArrayBindingPattern(name)) {
    return name.elements.flatMap((element) => {
      return isOmittedExpression(element) ? [] : bindingNames(element.name);
    });
  }

  return name.elements.flatMap((element) => bindingNames(element.name));
}

function readBlock(
  file: File,
  text: string,
  statement: Statement,
  tags: readonly TagDeclaration[],
): DocumentedBlock[] {
  const comment = (getLeadingCommentRanges(text, statement.pos) ?? [])
    .filter(({ pos, end }) => isJsdocComment(text.slice(pos, end)))
    .at(-1);

  if (comment === undefined) {
    return [];
  }

  const block = parseJsdoc(text.slice(comment.pos, comment.end), comment.pos);

  const signature: DocTag[] = [];
  const exported: DocTag[] = [];

  for (const tag of block.tags) {
    const read = readDocTag(tags, tag);

    if (!read.ok) {
      throw new Error(`\`${file}\`: \`@${tag.name}\` ${read.message}`);
    }

    (read.declaration.scope === "export" ? exported : signature).push(read.tag);
  }

  return [
    {
      signature: { description: block.description, tags: signature },
      exported,
    },
  ];
}

function listLocals(statements: readonly Statement[]): Locals {
  const byName = new Map<string, Local[]>();
  const byStatement = new Map<Statement, Local[]>();

  function add(statement: Statement, name: string | undefined, local: Local) {
    byStatement.set(statement, [...(byStatement.get(statement) ?? []), local]);

    if (name !== undefined) {
      byName.set(name, [...(byName.get(name) ?? []), local]);
    }
  }

  for (const statement of statements) {
    if (isVariableStatement(statement)) {
      for (const { name } of statement.declarationList.declarations) {
        for (const bound of bindingNames(name)) {
          add(statement, bound, {
            kind: "const",
            names: [bound],
            statements: [statement],
          });
        }
      }

      continue;
    }

    if (!isNamedStatement(statement)) {
      continue;
    }

    const name = statement.name?.text;

    const overloaded = isFunctionDeclaration(statement) && name !== undefined
      ? byName.get(name)?.find(({ kind }) => kind === "function")
      : undefined;

    if (overloaded === undefined) {
      add(statement, name, {
        kind: kindOf(statement),
        names: name === undefined ? [] : [name],
        statements: [statement],
      });
    } else {
      overloaded.statements.push(statement);
    }
  }

  return { byName, byStatement };
}

function signaturesOf({ kind, statements }: Local): Statement[] {
  return kind === "function" && statements.length > 1
    ? statements.filter((statement) => {
        return isFunctionDeclaration(statement) && statement.body === undefined;
      })
    : statements;
}

function listExports(
  statement: Statement,
  locals: Locals,
): [name: string, local: Local][] {
  if (isExportDeclaration(statement)) {
    const { exportClause, moduleSpecifier } = statement;

    if (
      moduleSpecifier !== undefined ||
      exportClause === undefined ||
      !isNamedExports(exportClause)
    ) {
      return [];
    }

    return exportClause.elements.flatMap(({ name, propertyName = name }) => {
      const found = locals.byName.get(propertyName.text) ?? [];

      return found.map((local): [string, Local] => [name.text, local]);
    });
  }

  if (isExportAssignment(statement)) {
    if (statement.isExportEquals === true) {
      return [];
    }

    const { expression } = statement;

    const found = isIdentifier(expression)
      ? (locals.byName.get(expression.text) ?? [])
      : [];

    // @debt `SourceDeclaration.kind` has no member for a default-exported expression, so it is reported as `const`
    return isNotEmpty(found)
      ? found.map((local): [string, Local] => ["default", local])
      : [
          [
            "default",
            {
              kind: "const",
              names: [],
              statements: [statement],
            },
          ],
        ];
  }

  if (!isExported(statement)) {
    return [];
  }

  const isDefault = hasModifier(statement, SyntaxKind.DefaultKeyword);

  return (locals.byStatement.get(statement) ?? []).flatMap((local) => {
    return isDefault
      ? [["default", local] as [string, Local]]
      : local.names.map((name): [string, Local] => [name, local]);
  });
}

function readDeclarations(
  file: File,
  text: string,
  tags: readonly TagDeclaration[],
): SourceDeclaration[] {
  const source = createSourceFile(file, text, ScriptTarget.Latest, true);

  const locals = listLocals(source.statements);

  return source.statements.flatMap((statement) => {
    return listExports(statement, locals).map(([name, local]) => {
      const blocks = signaturesOf(local).flatMap((signature) => {
        return readBlock(file, text, signature, tags);
      });

      return {
        name,
        kind: local.kind,
        tags: blocks[0]?.exported ?? [],
        signatures: blocks.map(({ signature }) => signature),
      };
    });
  });
}

export const declarationsSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<Declarations> {
    const { tags } = await config.resolve("docs");

    const { filesystem } = config.context;

    const cache = new Map<File, Promise<readonly SourceDeclaration[]>>();

    async function read(file: File): Promise<readonly SourceDeclaration[]> {
      const text = await filesystem.read(file);

      if (text === undefined) {
        throw new Error(
          `Cannot read the declarations of \`${file}\`: the file does not exist`,
        );
      }

      return freeze(readDeclarations(file, text, tags));
    }

    function of(file: File): Promise<readonly SourceDeclaration[]> {
      const declarations = cache.get(file) ?? read(file);

      cache.set(file, declarations);

      return declarations;
    }

    return freeze({ of });
  },
});
