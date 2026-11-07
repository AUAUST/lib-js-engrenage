import { join } from "node:path";

import {
  SymbolFlags,
  type Symbol,
  type Node as TsNode,
  type TypeChecker,
} from "typescript";
import type { Rule } from "eslint";

import { relativeWithin } from "#foundation/filesystem/index";
import {
  entitiesSection,
  environmentRolesSection,
  rankModule,
} from "#project/structure/index";
import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { defineStructureRule } from "#tools/eslint/utils/defineStructureRule";
import { isTypeOnlyNode } from "#tools/eslint/utils/isTypeOnlyNode";

export default defineConvention({
  files: ["files.src", "files.scripts", "files.tooling", "files.tests"],
  typeAware: true,
  sections: { entities: entitiesSection, roles: environmentRolesSection },
  rule: ({ entities, roles }, { root }) => {
    return defineStructureRule({
      entities,
      description:
        "A module of a ranked role imports at runtime only bindings declared in roles of its effect level or purer, and external modules ranked likewise.",
      messages: {
        effects:
          "A module of {{role}} ({{level}}) imports `{{binding}}` from {{target}} ({{targetLevel}}); import only {{level}} or purer bindings, or move the code.",
      },
      create(context, { environment, role: roleName, effects: level }) {
        const services = context.sourceCode.parserServices;

        if (
          environment === "dist" ||
          environment === "workspace" ||
          environment === "data" ||
          roleName === undefined ||
          level === undefined ||
          services?.program == null ||
          services.esTreeNodeToTSNodeMap == null
        ) {
          return {};
        }

        const { program, esTreeNodeToTSNodeMap } = services;
        const checker: TypeChecker = program.getTypeChecker();
        const { effects } = roles[environment];
        const allowed = effects.levels.indexOf(level);

        function declaringFile(symbol: Symbol | undefined) {
          if (symbol === undefined) {
            return;
          }

          const target =
            (symbol.flags & SymbolFlags.Alias) === 0
              ? symbol
              : checker.getAliasedSymbol(symbol);

          if (
            target.declarations?.length === 0 ||
            (target.flags & SymbolFlags.Value) === 0
          ) {
            return;
          }

          return target.declarations?.[0]?.getSourceFile();
        }

        function check({
          reported,
          specifier,
          binding,
          symbol,
        }: {
          reported: Rule.Node;
          specifier: string;
          binding: string;
          symbol: Symbol | undefined;
        }) {
          const file = declaringFile(symbol);

          if (file === undefined) {
            return;
          }

          let target: string;
          let targetLevel: string | undefined;

          if (
            program.isSourceFileFromExternalLibrary(file) ||
            file.fileName.includes("/node_modules/")
          ) {
            target = `the module \`${specifier}\``;
            targetLevel = rankModule(effects, specifier);

            if (targetLevel === undefined) {
              return;
            }
          } else {
            const declaring = entities.entityOf(file.fileName);

            if (declaring === undefined) {
              return;
            }

            const relativePath = relativeWithin(
              join(root, declaring.path),
              file.fileName,
            );

            target =
              declaring.role === undefined
                ? relativePath
                : `${declaring.role} (${relativePath})`;

            targetLevel = declaring.effects;
          }

          if (
            targetLevel !== undefined &&
            effects.levels.includes(targetLevel) &&
            effects.levels.indexOf(targetLevel) <= allowed
          ) {
            return;
          }

          context.report({
            node: reported,
            messageId: "effects",
            data: {
              role: roleName,
              level,
              binding,
              target,
              targetLevel: targetLevel ?? "unranked",
            },
          });
        }

        // @debt the ESTree-to-TS node map is untyped here, so nodes are cast `as TsNode` and `as never` with no stated invariant
        function symbolOf(node: object): Symbol | undefined {
          return checker.getSymbolAtLocation(
            esTreeNodeToTSNodeMap.get(node) as TsNode,
          );
        }

        return {
          ImportDeclaration(declaration) {
            if (isTypeOnlyNode(declaration)) {
              return;
            }

            const specifier = String(declaration.source.value);

            if (declaration.specifiers.length === 0) {
              return void check({
                reported: declaration,
                specifier,
                binding: specifier,
                symbol: symbolOf(declaration.source),
              });
            }

            for (const imported of declaration.specifiers) {
              if (isTypeOnlyNode(imported)) {
                continue;
              }

              check({
                reported: declaration,
                specifier,
                binding: imported.local.name,
                symbol: symbolOf(imported.local),
              });
            }
          },
          ExportAllDeclaration(declaration) {
            if (!isTypeOnlyNode(declaration)) {
              check({
                reported: declaration,
                specifier: String(declaration.source.value),
                binding: "*",
                symbol: symbolOf(declaration.source),
              });
            }
          },
          ExportNamedDeclaration(declaration) {
            if (declaration.source == null || isTypeOnlyNode(declaration)) {
              return;
            }

            for (const exported of declaration.specifiers) {
              if (isTypeOnlyNode(exported)) {
                continue;
              }

              const tsNode = esTreeNodeToTSNodeMap.get(exported);

              check({
                reported: declaration,
                specifier: String(declaration.source.value),
                binding:
                  exported.local.type === "Identifier"
                    ? exported.local.name
                    : String(exported.local.value),
                symbol: checker.getExportSpecifierLocalTargetSymbol(
                  tsNode as never,
                ),
              });
            }
          },
        };
      },
    });
  },
});
