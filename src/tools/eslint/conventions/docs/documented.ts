import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/types";
import {
  isExportSpecifier,
  SymbolFlags,
  type Program,
  type Symbol,
  type Node as TsNode,
  type TypeChecker,
} from "typescript";
import type { Rule } from "eslint";

import { entryRoleName } from "#batiment/roles/constants";
import { parseJsdoc } from "#foundation/jsdoc/index";
import { splitDocTag, type TagDeclaration } from "#project/docs/index";
import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { defineStructureRule } from "#tools/eslint/utils/defineStructureRule";
import { findJsdocBlock } from "#tools/eslint/utils/findJsdocBlock";
import { readOverload } from "#tools/eslint/utils/readOverload";
import type { EntityIndex } from "#batiment/structure/index";

// @debt the contract roles are found by their preset names, while a preset's `name` option lets a project rename them
const contractRoles: ReadonlySet<string> = new Set(["ports", "apis"]);

const entryExports = new WeakMap<Program, ReadonlySet<Symbol>>();

function listEntryExports(
  program: Program,
  entities: EntityIndex,
): ReadonlySet<Symbol> {
  const known = entryExports.get(program);

  if (known !== undefined) {
    return known;
  }

  const checker = program.getTypeChecker();
  const exported = new Set<Symbol>();

  for (const file of program.getSourceFiles()) {
    if (entities.entityOf(file.fileName)?.role !== entryRoleName) {
      continue;
    }

    const module = checker.getSymbolAtLocation(file);

    for (const symbol of module === undefined
      ? []
      : checker.getExportsOfModule(module)) {
      exported.add(
        (symbol.flags & SymbolFlags.Alias) === 0
          ? symbol
          : checker.getAliasedSymbol(symbol),
      );
    }
  }

  entryExports.set(program, exported);

  return exported;
}

function isDocumented(
  sourceCode: Rule.RuleContext["sourceCode"],
  node: TSESTree.Node,
  declarations: ReadonlyMap<string, TagDeclaration>,
): boolean {
  const block = findJsdocBlock(sourceCode, node)?.range;

  if (block === undefined) {
    return false;
  }

  const {
    description,
    tags,
  } = parseJsdoc(sourceCode.text.slice(block[0], block[1]), block[0]);

  return (
    description.trim() !== "" ||
    tags.some(({ name, text }) => {
      const declaration = declarations.get(name);

      if (declaration?.body !== "text" || declaration.output === "internal") {
        return false;
      }

      const split = splitDocTag(declaration, text);

      return split.ok && split.body !== "";
    })
  );
}

function listBoundNames(pattern: TSESTree.Node): TSESTree.Identifier[] {
  switch (pattern.type) {
    case AST_NODE_TYPES.Identifier: {
      return [pattern];
    }

    case AST_NODE_TYPES.ArrayPattern: {
      return pattern.elements.flatMap((element) => {
        return element == null ? [] : listBoundNames(element);
      });
    }

    case AST_NODE_TYPES.ObjectPattern: {
      return pattern.properties.flatMap((property) => {
        return property.type === AST_NODE_TYPES.RestElement
          ? listBoundNames(property.argument)
          : listBoundNames(property.value);
      });
    }

    case AST_NODE_TYPES.RestElement: {
      return listBoundNames(pattern.argument);
    }

    case AST_NODE_TYPES.AssignmentPattern: {
      return listBoundNames(pattern.left);
    }

    default: {
      return [];
    }
  }
}

function listDeclaredNames(
  declaration: TSESTree.ExportNamedDeclaration["declaration"],
): TSESTree.Identifier[] {
  if (declaration == null) {
    return [];
  }

  if (declaration.type === AST_NODE_TYPES.VariableDeclaration) {
    return declaration.declarations.flatMap(({ id }) => listBoundNames(id));
  }

  return declaration.id?.type === AST_NODE_TYPES.Identifier
    ? [declaration.id]
    : [];
}

function listOverloadSignatures(
  program: TSESTree.Program,
): Map<string, TSESTree.ProgramStatement[]> {
  const groups = new Map<string, TSESTree.ProgramStatement[]>();

  for (const statement of program.body) {
    const overload = readOverload(statement);

    if (overload === undefined || overload.implementation) {
      continue;
    }

    groups.set(overload.key, [...(groups.get(overload.key) ?? []), statement]);
  }

  return groups;
}

function statementOf(
  program: TSESTree.Program,
  [start, end]: TSESTree.Range,
): TSESTree.ProgramStatement | undefined {
  return program.body.find(({ range }) => {
    return range[0] <= start && end <= range[1];
  });
}

function memberName(
  sourceCode: Rule.RuleContext["sourceCode"],
  member: TSESTree.TypeElement,
): string {
  // @debt ESLint types its AST as ESTree, without the TypeScript nodes the parser produces
  return "key" in member
    ? sourceCode.getText(member.key as never)
    : "signature";
}

export default defineConvention({
  files: ["files.src"],
  typeAware: true,
  severity: "info",
  sections: { entities: "entities", docs: "docs" },
  rule: ({ entities, docs }) => {
    const declarations: ReadonlyMap<
      string,
      TagDeclaration
    > = new Map(docs.tags.map((tag) => [tag.name, tag] as const));

    return defineStructureRule({
      entities,
      description: "Each member of a `ports` or `apis` interface and each declaration a package entry exports has a JSDoc description or a public `text` doc tag with a body.",
      messages: {
        member: "Document `{{name}}`: its implementations live elsewhere, so state the behavior its name and signature leave open.",
        export: "Document `{{name}}`: a package entry exports it and consumers never see its source, so state the behavior its name and signature leave open.",
      },
      create(context, { role }) {
        const { sourceCode } = context;

        // @debt ESLint types its AST as ESTree, without the TypeScript nodes the parser produces
        function report(node: TSESTree.Node, messageId: string, name: string) {
          context.report({
            node,
            messageId,
            data: { name },
          });
        }

        if (role !== undefined && contractRoles.has(role)) {
          return {
            TSInterfaceDeclaration(node: Rule.Node) {
              // @debt ESLint types its AST as ESTree, without the TypeScript nodes the parser produces
              const declaration = node as unknown as TSESTree.TSInterfaceDeclaration;

              const parent = declaration.parent;

              if (
                parent.type !== AST_NODE_TYPES.ExportNamedDeclaration &&
                parent.type !== AST_NODE_TYPES.ExportDefaultDeclaration
              ) {
                return;
              }

              for (const member of declaration.body.body) {
                if (!isDocumented(sourceCode, member, declarations)) {
                  report(member, "member", memberName(sourceCode, member));
                }
              }
            },
          };
        }

        const services = sourceCode.parserServices;

        if (
          services?.program == null ||
          services.esTreeNodeToTSNodeMap == null
        ) {
          return {};
        }

        const { program, esTreeNodeToTSNodeMap } = services;
        const checker: TypeChecker = program.getTypeChecker();

        // @debt ESLint types its AST as ESTree, without the TypeScript nodes the parser produces
        const root = sourceCode.ast as unknown as TSESTree.Program;

        const overloads = listOverloadSignatures(root);

        function signaturesOf(
          statement: TSESTree.ProgramStatement,
        ): readonly TSESTree.ProgramStatement[] | undefined {
          const overload = readOverload(statement);

          return overload === undefined
            ? undefined
            : overloads.get(overload.key);
        }

        function isStatementDocumented(
          statement: TSESTree.ProgramStatement,
        ): boolean {
          const signatures = signaturesOf(statement);

          return signatures === undefined
            ? isDocumented(sourceCode, statement, declarations)
            : signatures.some((signature) => {
                return isDocumented(sourceCode, signature, declarations);
              });
        }

        // @debt the ESTree-to-TS node map is untyped here, so nodes are cast `as TsNode` with no stated invariant
        function symbolOf(node: TSESTree.Node): Symbol | undefined {
          const symbol = checker.getSymbolAtLocation(
            esTreeNodeToTSNodeMap.get(node) as TsNode,
          );

          return symbol === undefined
            ? undefined
            : checker.getExportSymbolOfSymbol(symbol);
        }

        function defaultSymbol(): Symbol | undefined {
          const module = symbolOf(root);

          return module === undefined
            ? undefined
            : checker.getExportsOfModule(module).find(({ name }) => {
                return name === "default";
              });
        }

        // @debt the ESTree-to-TS node map is untyped here, so nodes are cast `as TsNode` with no stated invariant
        function localTargetOf(node: TSESTree.Node): Symbol | undefined {
          const target = esTreeNodeToTSNodeMap.get(node) as TsNode;

          const symbol = isExportSpecifier(target)
            ? checker.getExportSpecifierLocalTargetSymbol(target)
            : checker.getSymbolAtLocation(target);

          return symbol === undefined
            ? undefined
            : checker.getExportSymbolOfSymbol(symbol);
        }

        function isLocalDocumented(symbol: Symbol): boolean {
          const file = esTreeNodeToTSNodeMap.get(root);

          const statements = (symbol.declarations ?? []).flatMap(
            (declaration) => {
              const statement = declaration.getSourceFile() === file
                ? statementOf(root, [declaration.getStart(), declaration.end])
                : undefined;

              return statement === undefined ? [] : [statement];
            },
          );

          return statements.every(isStatementDocumented);
        }

        function checkLocal(
          node: TSESTree.Node,
          name: string,
          exported: ReadonlySet<Symbol>,
        ) {
          const symbol = localTargetOf(node);

          if (
            symbol !== undefined &&
            exported.has(symbol) &&
            !isLocalDocumented(symbol)
          ) {
            report(node, "export", name);
          }
        }

        function checkLocalExports(
          statement: TSESTree.ProgramStatement,
          exported: ReadonlySet<Symbol>,
        ): boolean {
          if (
            statement.type === AST_NODE_TYPES.ExportDefaultDeclaration &&
            statement.declaration.type === AST_NODE_TYPES.Identifier
          ) {
            checkLocal(statement.declaration, "default", exported);

            return true;
          }

          if (
            statement.type !== AST_NODE_TYPES.ExportNamedDeclaration ||
            statement.declaration != null ||
            statement.source != null
          ) {
            return false;
          }

          for (const specifier of statement.specifiers) {
            const name = specifier.exported.type === AST_NODE_TYPES.Identifier
              ? specifier.exported.name
              : specifier.exported.value;

            checkLocal(specifier, name, exported);
          }

          return true;
        }

        function check(
          statement: TSESTree.ProgramStatement,
          exported: ReadonlySet<Symbol>,
        ) {
          if (statement.type === AST_NODE_TYPES.ExportDefaultDeclaration) {
            const symbol = defaultSymbol();

            if (symbol !== undefined && exported.has(symbol)) {
              report(statement, "export", "default");
            }

            return;
          }

          if (statement.type !== AST_NODE_TYPES.ExportNamedDeclaration) {
            return;
          }

          for (const name of listDeclaredNames(statement.declaration)) {
            const symbol = symbolOf(name);

            if (symbol !== undefined && exported.has(symbol)) {
              report(name, "export", name.name);
            }
          }
        }

        return {
          Program() {
            const exported = listEntryExports(program, entities);

            for (const statement of root.body) {
              if (checkLocalExports(statement, exported)) {
                continue;
              }

              const reported = signaturesOf(statement)?.[0] ?? statement;

              if (reported === statement && !isStatementDocumented(statement)) {
                check(statement, exported);
              }
            }
          },
        };
      },
    });
  },
});
