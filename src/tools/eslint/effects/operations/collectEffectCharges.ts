import { join } from "node:path";

import {
  SymbolFlags,
  type Symbol,
  type Node as TsNode,
  type TypeChecker,
} from "typescript";
import type { Rule } from "eslint";

import {
  highestLevel,
  rankMember,
  rankUnit,
  type ResolvedEffects,
} from "#batiment/effects/index";
import { entryRoleName } from "#batiment/roles/constants";
import { relativeWithin } from "#foundation/filesystem/index";
import { isTypeOnlyNode } from "#tools/eslint/utils/isTypeOnlyNode";
import type { EntityIndex } from "#batiment/structure/index";
import type { EffectCharge } from "#tools/eslint/effects/types/EffectCharge";
import type { Directory } from "#types/Directory";

const functionTypes: ReadonlySet<string> = new Set([
  "FunctionDeclaration",
  "FunctionExpression",
  "ArrowFunctionExpression",
]);

export function collectEffectCharges({
  context,
  entities,
  effects,
  root,
  charge,
}: {
  context: Rule.RuleContext;
  entities: EntityIndex;
  effects: ResolvedEffects;
  root: Directory;
  charge(found: EffectCharge): void;
}): Rule.RuleListener {
  const services = context.sourceCode.parserServices;

  if (services?.program == null || services.esTreeNodeToTSNodeMap == null) {
    return {};
  }

  const { program, esTreeNodeToTSNodeMap } = services;
  const checker: TypeChecker = program.getTypeChecker();

  function enclosingFunction(node: Rule.Node): Rule.Node | undefined {
    for (
      let ancestor: Rule.Node | null = node.parent;
      ancestor != null;
      ancestor = ancestor.parent
    ) {
      if (functionTypes.has(ancestor.type)) {
        return ancestor;
      }
    }
  }

  function declaringFile(symbol: Symbol | undefined) {
    if (symbol === undefined) {
      return;
    }

    const target = (symbol.flags & SymbolFlags.Alias) === 0
      ? symbol
      : checker.getAliasedSymbol(symbol);

    if (
      target.declarations?.length === 0 ||
      (target.flags & SymbolFlags.Value) === 0
    ) {
      return;
    }

    // @debt Only the first declaration ranks a merged symbol; declarations spread over several files may rank differently.
    return target.declarations?.[0]?.getSourceFile();
  }

  function rankImport(specifier: string, imported: string | undefined) {
    if (imported !== undefined) {
      return rankMember(effects, specifier, imported);
    }

    const { level, members } = rankUnit(effects, specifier);

    return level === undefined
      ? undefined
      : highestLevel(effects.levels, [level, ...members.values()]);
  }

  function collect({
    node,
    specifier,
    binding,
    symbol,
    imported,
  }: {
    node: Rule.Node;
    specifier: string;
    binding: string;
    symbol: Symbol | undefined;
    imported?: string;
  }) {
    const file = declaringFile(symbol);

    if (file === undefined) {
      return;
    }

    // @debt A `/node_modules/` substring decides what is external; a symlinked workspace package resolves to its real path and may fall through `entityOf` unranked and unreported.
    if (
      program.isSourceFileFromExternalLibrary(file) ||
      file.fileName.includes("/node_modules/")
    ) {
      const level = rankImport(specifier, imported);

      if (level !== undefined) {
        charge({
          node,
          function: enclosingFunction(node),
          binding,
          target: `the module \`${specifier}\``,
          level,
        });
      }

      return;
    }

    const declaring = entities.entityOf(file.fileName);

    if (declaring === undefined) {
      return;
    }

    const relativePath = relativeWithin(
      join(root, declaring.path),
      file.fileName,
    );

    charge({
      node,
      function: enclosingFunction(node),
      binding,
      target: declaring.role === undefined
        ? relativePath
        : `${declaring.role} (${relativePath})`,
      // @debt A value declared in a local ambient `declare module` resolves to the unranked `declarations` role, so a ranked importer of that module is reported as importing an unranked target.
      level: declaring.effects?.invocation,
    });
  }

  function collectExports({
    node,
    specifier,
    module,
  }: {
    node: Rule.Node;
    specifier: string;
    module: Symbol;
  }) {
    for (const exported of checker.getExportsOfModule(module)) {
      collect({
        node,
        specifier,
        binding: exported.name,
        imported: exported.name,
        symbol: exported,
      });
    }
  }

  function entryModuleOf(symbol: Symbol | undefined) {
    if (symbol === undefined || (symbol.flags & SymbolFlags.Alias) === 0) {
      return;
    }

    const module = checker.getAliasedSymbol(symbol);
    const file = module.declarations?.[0]?.getSourceFile();

    return file !== undefined &&
      entities.entityOf(file.fileName)?.role === entryRoleName
      ? module
      : undefined;
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
        // @debt module evaluation cannot be ranked separately from imported bindings, so bare side-effect imports use the module's highest binding level
        return void collect({
          node: declaration,
          specifier,
          binding: specifier,
          symbol: symbolOf(declaration.source),
        });
      }

      for (const imported of declaration.specifiers) {
        if (isTypeOnlyNode(imported)) {
          continue;
        }

        const symbol = symbolOf(imported.local);

        if (imported.type === "ImportNamespaceSpecifier") {
          const entry = entryModuleOf(symbol);

          if (entry !== undefined) {
            collectExports({
              node: declaration,
              specifier,
              module: entry,
            });

            continue;
          }
        }

        collect({
          node: declaration,
          specifier,
          binding: imported.local.name,
          ...(imported.type === "ImportSpecifier"
            ? {
                imported: imported.imported.type === "Identifier"
                  ? imported.imported.name
                  : String(imported.imported.value),
              }
            : imported.type === "ImportDefaultSpecifier"
              ? { imported: "default" }
              : {}),
          symbol,
        });
      }
    },
    ImportExpression(expression) {
      if (expression.source.type !== "Literal") {
        return;
      }

      const loaded = symbolOf(expression.source);

      if (loaded === undefined) {
        return;
      }

      collectExports({
        node: expression,
        specifier: String(expression.source.value),
        module: loaded,
      });
    },
    ExportAllDeclaration(declaration) {
      if (!isTypeOnlyNode(declaration)) {
        collect({
          node: declaration,
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

        const local = exported.local.type === "Identifier"
          ? exported.local.name
          : String(exported.local.value);

        collect({
          node: declaration,
          specifier: String(declaration.source.value),
          binding: local,
          imported: local,
          symbol: checker.getExportSpecifierLocalTargetSymbol(
            esTreeNodeToTSNodeMap.get(exported) as never,
          ),
        });
      }
    },
  };
}
