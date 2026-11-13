import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/types";
import {
  SymbolFlags,
  type Program,
  type Symbol,
  type Node as TsNode,
  type TypeChecker,
} from "typescript";
import type { Rule } from "eslint";

import { parseJsdoc } from "#foundation/jsdoc/index";
import { entryRoleName } from "#project/roles/constants";
import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { defineStructureRule } from "#tools/eslint/utils/defineStructureRule";
import { findJsdocBlock } from "#tools/eslint/utils/findJsdocBlock";
import type { EntityIndex } from "#project/structure/index";

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
): boolean {
  const block = findJsdocBlock(sourceCode, node)?.range;

  return (
    block !== undefined &&
    parseJsdoc(
      sourceCode.text.slice(block[0], block[1]),
      block[0],
    ).description.trim() !== ""
  );
}

function listDeclaredNames(
  declaration: TSESTree.ExportNamedDeclaration["declaration"],
): TSESTree.Identifier[] {
  if (declaration == null) {
    return [];
  }

  if (declaration.type === AST_NODE_TYPES.VariableDeclaration) {
    return declaration.declarations.flatMap(({ id }) => {
      return id.type === AST_NODE_TYPES.Identifier ? [id] : [];
    });
  }

  return declaration.id?.type === AST_NODE_TYPES.Identifier
    ? [declaration.id]
    : [];
}

function listOverloaded(program: TSESTree.Program): Set<string> {
  const names = new Set<string>();

  for (const statement of program.body) {
    if (
      statement.type === AST_NODE_TYPES.ExportNamedDeclaration &&
      statement.declaration?.type === AST_NODE_TYPES.TSDeclareFunction &&
      statement.declaration.id != null
    ) {
      names.add(statement.declaration.id.name);
    }
  }

  return names;
}

function isOverloadImplementation(
  statement: TSESTree.ProgramStatement,
  overloaded: ReadonlySet<string>,
): boolean {
  const declaration = statement.type === AST_NODE_TYPES.ExportNamedDeclaration
    ? statement.declaration
    : undefined;

  return (
    declaration?.type === AST_NODE_TYPES.FunctionDeclaration &&
    declaration.id != null &&
    overloaded.has(declaration.id.name)
  );
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
  sections: { entities: "entities" },
  rule: ({ entities }) => {
    return defineStructureRule({
      entities,
      description: "Each member of a `ports` or `apis` interface and each declaration a package entry exports has a JSDoc description.",
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
                if (!isDocumented(sourceCode, member)) {
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

        function check(
          statement: TSESTree.ProgramStatement,
          exported: ReadonlySet<Symbol>,
        ) {
          if (
            statement.type === AST_NODE_TYPES.ExportDefaultDeclaration &&
            statement.declaration.type !== AST_NODE_TYPES.Identifier
          ) {
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
            const overloaded = listOverloaded(root);

            for (const statement of root.body) {
              if (
                !isOverloadImplementation(statement, overloaded) &&
                !isDocumented(sourceCode, statement)
              ) {
                check(statement, exported);
              }
            }
          },
        };
      },
    });
  },
});
