import { SymbolFlags, type Symbol, type TypeChecker } from "typescript";
import type { Rule, SourceCode } from "eslint";

import { typeNodeTypes } from "#tools/eslint/effects/constants";
import { chargeAccesses } from "#tools/eslint/effects/operations/chargeAccesses";
import { isTypeOnlyNode } from "#tools/eslint/utils/isTypeOnlyNode";
import type { createEffectRanker } from "#tools/eslint/effects/operations/createEffectRanker";
import type { EffectHint } from "#tools/eslint/effects/types/EffectHint";
import type { PendingCharge } from "#tools/eslint/effects/types/PendingCharge";
import type { RankedUnit } from "#tools/eslint/effects/types/RankedUnit";
import type { SyntaxNode } from "#tools/eslint/effects/types/SyntaxNode";

type ImportNode = Parameters<
  NonNullable<Rule.RuleListener["ImportDeclaration"]>
>[0];

type HintedUnit = RankedUnit & {
  binding: string;
  hint: EffectHint | undefined;
};

/**
 * Passes to `append` what each use of a binding `declaration` imports charges:
 * an invocation or a read of a ranked member path at its rank, and a callable
 * binding passed or stored without being invoked, outside a type or a re-export,
 * as a `pass` hint charging what invoking it costs.
 */
export function chargeImportBindings({
  sourceCode,
  checker,
  declaration,
  symbolOf,
  rankAccess,
  append,
}: {
  sourceCode: SourceCode;
  checker: TypeChecker;
  declaration: ImportNode;
  symbolOf(node: object): Symbol | undefined;
  rankAccess: ReturnType<typeof createEffectRanker>["rankAccess"];
  append(runner: SyntaxNode | undefined, pending: PendingCharge): void;
}) {
  const specifier = String(declaration.source.value);

  function moduleOf(symbol: Symbol | undefined) {
    return symbol !== undefined && (symbol.flags & SymbolFlags.Alias) !== 0
      ? checker.getAliasedSymbol(symbol)
      : symbol;
  }

  function isCallable(symbol: Symbol | undefined): boolean {
    const resolved = moduleOf(symbol);

    if (resolved === undefined) {
      return false;
    }

    const type = checker.getTypeOfSymbol(resolved);

    return (
      type.getCallSignatures().length > 0 ||
      type.getConstructSignatures().length > 0
    );
  }

  function passOf(
    symbol: Symbol | undefined,
    path: readonly string[],
    site: SyntaxNode,
    binding: string,
  ): HintedUnit | undefined {
    const ancestors = sourceCode.getAncestors(site);

    if (
      ancestors.at(-1)?.type === "ExportSpecifier" ||
      ancestors.some(({ type }) => typeNodeTypes.has(type)) ||
      !isCallable(symbol)
    ) {
      return;
    }

    const ranked = rankAccess(symbol, specifier, path, true);

    return (
      ranked && {
        ...ranked,
        binding,
        hint: "pass",
      }
    );
  }

  for (const imported of declaration.specifiers) {
    if (isTypeOnlyNode(imported)) {
      continue;
    }

    const local = imported.local.name;
    const symbol = symbolOf(imported.local);
    const variables = sourceCode.getDeclaredVariables(imported);

    if (imported.type === "ImportNamespaceSpecifier") {
      const module = moduleOf(symbol);

      chargeAccesses(
        sourceCode,
        variables,
        append,
        (members, invoked, site) => {
          const [member] = members;

          if (member === undefined || module === undefined) {
            return;
          }

          const exported = checker.tryGetMemberInModuleExports(member, module);

          if (!invoked && members.length === 1) {
            return passOf(exported, [member], site, `${local}.${member}`);
          }

          // @debt a read takes the rank of a member key alone, so reading a ranked method through a namespace import without calling it (`fs.existsSync`) charges what calling it does
          const ranked = rankAccess(exported, specifier, members, invoked);

          return (
            ranked && {
              ...ranked,
              binding: [local, ...(invoked ? [member] : members)].join("."),
              hint: undefined,
            }
          );
        },
      );

      continue;
    }

    const name = imported.type === "ImportDefaultSpecifier"
      ? "default"
      : imported.imported.type === "Identifier"
        ? imported.imported.name
        : String(imported.imported.value);

    chargeAccesses(sourceCode, variables, append, (members, invoked, site) => {
      if (!invoked && members.length === 0) {
        return passOf(symbol, [name], site, local);
      }

      const ranked = rankAccess(symbol, specifier, [name, ...members], invoked);

      return (
        ranked && {
          ...ranked,
          binding: invoked ? local : [local, ...members].join("."),
          hint: undefined,
        }
      );
    });
  }
}
