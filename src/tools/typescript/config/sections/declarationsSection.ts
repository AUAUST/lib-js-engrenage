import {
  canHaveModifiers,
  createSourceFile,
  getLeadingCommentRanges,
  getModifiers,
  isArrayBindingPattern,
  isClassDeclaration,
  isEnumDeclaration,
  isFunctionDeclaration,
  isIdentifier,
  isInterfaceDeclaration,
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

import { freeze } from "@auaust/toolkit/object";

import { parseJsdoc } from "#foundation/jsdoc/index";
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

function nameOf(statement: NamedStatement): string | undefined {
  return hasModifier(statement, SyntaxKind.DefaultKeyword)
    ? "default"
    : statement.name?.text;
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
    .filter(({ kind, pos, end }) => {
      return (
        kind === SyntaxKind.MultiLineCommentTrivia &&
        text.startsWith("/**", pos) &&
        end - pos > 4
      );
    })
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

    const scope = tags.find(({ name }) => name === tag.name)?.scope;

    (scope === "export" ? exported : signature).push(read.tag);
  }

  return [
    {
      signature: { description: block.description, tags: signature },
      exported,
    },
  ];
}

function declare(
  name: string,
  kind: SourceDeclaration["kind"],
  blocks: readonly DocumentedBlock[],
): SourceDeclaration {
  return {
    name,
    kind,
    tags: blocks[0]?.exported ?? [],
    signatures: blocks.map(({ signature }) => signature),
  };
}

function takeOverloads(
  statements: readonly Statement[],
  first: FunctionDeclaration,
): FunctionDeclaration[] {
  const group = [first];

  for (const next of statements.slice(statements.indexOf(first) + 1)) {
    if (!isFunctionDeclaration(next) || nameOf(next) !== nameOf(first)) {
      break;
    }

    group.push(next);
  }

  return group;
}

function readDeclarations(
  file: File,
  text: string,
  tags: readonly TagDeclaration[],
): SourceDeclaration[] {
  const source = createSourceFile(file, text, ScriptTarget.Latest, true);

  const statements = source.statements.filter(isExported);

  const declarations: SourceDeclaration[] = [];
  const grouped = new Set<Statement>();

  for (const statement of statements) {
    if (grouped.has(statement)) {
      continue;
    }

    if (isVariableStatement(statement)) {
      const blocks = readBlock(file, text, statement, tags);

      for (const { name } of statement.declarationList.declarations) {
        for (const bound of bindingNames(name)) {
          declarations.push(declare(bound, "const", blocks));
        }
      }

      continue;
    }

    if (!isNamedStatement(statement)) {
      continue;
    }

    const name = nameOf(statement);

    if (name === undefined) {
      continue;
    }

    if (!isFunctionDeclaration(statement)) {
      declarations.push(
        declare(
          name,
          kindOf(statement),
          readBlock(file, text, statement, tags),
        ),
      );

      continue;
    }

    const group = takeOverloads(statements, statement);

    for (const overload of group) {
      grouped.add(overload);
    }

    const signatures = group.length > 1
      ? group.filter(({ body }) => body === undefined)
      : group;

    declarations.push(
      declare(
        name,
        "function",
        signatures.flatMap((overload) => readBlock(file, text, overload, tags)),
      ),
    );
  }

  return declarations;
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
