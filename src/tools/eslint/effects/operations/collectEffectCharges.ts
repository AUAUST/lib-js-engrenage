import {
  SymbolFlags,
  type Symbol,
  type Node as TsNode,
  type TypeChecker,
} from "typescript";
import type { Rule, Scope } from "eslint";

import { isString } from "@auaust/toolkit";

import {
  classNodeTypes,
  functionNodeTypes,
} from "#tools/eslint/effects/constants";
import { createEffectRanker } from "#tools/eslint/effects/operations/createEffectRanker";
import { invocationOf } from "#tools/eslint/effects/utils/invocationOf";
import { runnerOf } from "#tools/eslint/effects/utils/runnerOf";
import { isTypeOnlyNode } from "#tools/eslint/utils/isTypeOnlyNode";
import type { ResolvedEffects } from "#batiment/effects/index";
import type { EntityIndex } from "#batiment/structure/index";
import type { EffectCharge } from "#tools/eslint/effects/types/EffectCharge";
import type { RankedUnit } from "#tools/eslint/effects/types/RankedUnit";
import type { SyntaxNode } from "#tools/eslint/effects/types/SyntaxNode";
import type { Directory } from "#types/Directory";

type PendingCharge = Omit<EffectCharge, "position" | "through">;

interface LocalCall {
  callee: SyntaxNode;
  node: SyntaxNode;
  name: string;
}

function isGenerator(node: SyntaxNode): boolean {
  return "generator" in node && node.generator === true;
}

/**
 * Collects what each use of an imported binding charges, by the position running
 * it: a charge belongs to the innermost function whose body runs it, and a local
 * function or class invoked while the module evaluates charges there what its
 * own body runs, through the local calls it makes in turn.
 */
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
  const { sourceCode } = context;
  const services = sourceCode.parserServices;

  if (services?.program == null || services.esTreeNodeToTSNodeMap == null) {
    return {};
  }

  const { program, esTreeNodeToTSNodeMap } = services;
  const checker: TypeChecker = program.getTypeChecker();

  const { rankModule, rankBinding } = createEffectRanker({
    program,
    checker,
    entities,
    effects,
    root,
  });

  const runs = new Map<SyntaxNode | undefined, PendingCharge[]>();
  const calls = new Map<SyntaxNode | undefined, LocalCall[]>();

  function append<Value>(
    map: Map<SyntaxNode | undefined, Value[]>,
    runner: SyntaxNode | undefined,
    value: Value,
  ) {
    const list = map.get(runner);

    if (list === undefined) {
      map.set(runner, [value]);
    } else {
      list.push(value);
    }
  }

  // @debt the ESTree-to-TS node map is untyped here, so nodes are cast `as TsNode` and `as never` with no stated invariant
  function symbolOf(node: object): Symbol | undefined {
    return checker.getSymbolAtLocation(
      esTreeNodeToTSNodeMap.get(node) as TsNode,
    );
  }

  function moduleOf(symbol: Symbol | undefined) {
    return symbol !== undefined && (symbol.flags & SymbolFlags.Alias) !== 0
      ? checker.getAliasedSymbol(symbol)
      : symbol;
  }

  function chargeModule({
    node,
    source,
    specifier,
    runner,
  }: {
    node: SyntaxNode;
    source: SyntaxNode;
    specifier: string;
    runner: SyntaxNode | undefined;
  }) {
    const loaded = rankModule(symbolOf(source), specifier);

    if (loaded !== undefined) {
      append(runs, runner, {
        node,
        operation: "evaluate",
        binding: specifier,
        ...loaded,
      });
    }
  }

  function* invocationsOf(variables: readonly Scope.Variable[]) {
    for (const { references } of variables) {
      for (const { identifier } of references) {
        if (identifier.type === "JSXIdentifier") {
          continue;
        }

        const invocation = invocationOf(
          sourceCode.getAncestors(identifier),
          identifier,
        );

        if (invocation !== undefined) {
          yield invocation;
        }
      }
    }
  }

  function chargeInvocations(
    variables: readonly Scope.Variable[],
    rank: (
      members: readonly string[],
    ) => (RankedUnit & { binding: string }) | undefined,
  ) {
    for (const invocation of invocationsOf(variables)) {
      const ranked = rank(invocation.members);

      if (ranked !== undefined) {
        append(runs, invocation.runner, {
          node: invocation.site,
          operation: "invoke",
          ...ranked,
        });
      }
    }
  }

  function recordLocal(
    variables: readonly Scope.Variable[],
    callee: SyntaxNode,
    name: string,
  ) {
    for (const invocation of invocationsOf(variables)) {
      if (invocation.members.length === 0) {
        append(calls, invocation.runner, {
          callee,
          node: invocation.site,
          name,
        });
      }
    }
  }

  function chargeThrough({ callee, node, name }: LocalCall) {
    const visited = new Set<SyntaxNode>();
    const pending = [callee];

    for (
      let runner = pending.pop();
      runner !== undefined;
      runner = pending.pop()
    ) {
      if (visited.has(runner)) {
        continue;
      }

      visited.add(runner);

      for (const ran of runs.get(runner) ?? []) {
        charge({
          ...ran,
          node,
          position: "evaluation",
          through: name,
        });
      }

      for (const call of calls.get(runner) ?? []) {
        pending.push(call.callee);
      }
    }
  }

  return {
    "ImportDeclaration"(declaration) {
      if (isTypeOnlyNode(declaration)) {
        return;
      }

      const specifier = String(declaration.source.value);

      chargeModule({
        node: declaration,
        source: declaration.source,
        specifier,
        runner: undefined,
      });

      for (const imported of declaration.specifiers) {
        if (isTypeOnlyNode(imported)) {
          continue;
        }

        const local = imported.local.name;
        const symbol = symbolOf(imported.local);
        const variables = sourceCode.getDeclaredVariables(imported);

        if (imported.type === "ImportNamespaceSpecifier") {
          const module = moduleOf(symbol);

          chargeInvocations(variables, ([member]) => {
            if (member === undefined || module === undefined) {
              return;
            }

            const ranked = rankBinding(
              checker.tryGetMemberInModuleExports(member, module),
              specifier,
              member,
            );

            return ranked && { ...ranked, binding: `${local}.${member}` };
          });

          continue;
        }

        const name = imported.type === "ImportDefaultSpecifier"
          ? "default"
          : imported.imported.type === "Identifier"
            ? imported.imported.name
            : String(imported.imported.value);

        const ranked = rankBinding(symbol, specifier, name);

        if (ranked !== undefined) {
          chargeInvocations(variables, () => {
            return { ...ranked, binding: local };
          });
        }
      }
    },
    "ImportExpression"(expression) {
      const runner = runnerOf([
        ...sourceCode.getAncestors(expression),
        expression,
      ]);

      const { source } = expression;

      if (source.type !== "Literal" || !isString(source.value)) {
        const { fallback } = effects;

        if (fallback !== undefined) {
          append(runs, runner, {
            node: expression,
            operation: "evaluate",
            binding: sourceCode.getText(source),
            unit: "a module lint cannot rank",
            target: { evaluation: fallback, invocation: fallback },
          });
        }

        return;
      }

      const specifier = source.value;
      const module = symbolOf(source);

      chargeModule({
        node: expression,
        source,
        specifier,
        runner,
      });

      if (module === undefined) {
        return;
      }

      for (const exported of checker.getExportsOfModule(module)) {
        const ranked = rankBinding(exported, specifier, exported.name);

        if (ranked !== undefined) {
          append(runs, runner, {
            node: expression,
            operation: "invoke",
            binding: exported.name,
            ...ranked,
          });
        }
      }
    },
    "ExportAllDeclaration"(declaration) {
      if (!isTypeOnlyNode(declaration)) {
        chargeModule({
          node: declaration,
          source: declaration.source,
          specifier: String(declaration.source.value),
          runner: undefined,
        });
      }
    },
    "ExportNamedDeclaration"(declaration) {
      if (declaration.source != null && !isTypeOnlyNode(declaration)) {
        chargeModule({
          node: declaration,
          source: declaration.source,
          specifier: String(declaration.source.value),
          runner: undefined,
        });
      }
    },
    "FunctionDeclaration"(declaration) {
      if (declaration.id != null && !isGenerator(declaration)) {
        recordLocal(
          sourceCode.getDeclaredVariables(declaration).filter(({ defs }) => {
            return defs.some(({ type }) => {
              return type === "FunctionName";
            });
          }),
          declaration,
          declaration.id.name,
        );
      }
    },
    "ClassDeclaration"(declaration) {
      if (declaration.id != null) {
        recordLocal(
          sourceCode.getDeclaredVariables(declaration),
          declaration,
          declaration.id.name,
        );
      }
    },
    "VariableDeclarator"(declarator) {
      const { id, init } = declarator;

      if (
        declarator.parent.type === "VariableDeclaration" &&
        declarator.parent.kind === "const" &&
        id.type === "Identifier" &&
        init != null &&
        (functionNodeTypes.includes(init.type) ||
          classNodeTypes.includes(init.type)) &&
        !isGenerator(init)
      ) {
        recordLocal(sourceCode.getDeclaredVariables(declarator), init, id.name);
      }
    },
    "Program:exit"() {
      for (const [runner, ran] of runs) {
        for (const pending of ran) {
          charge({
            ...pending,
            position: runner === undefined ? "evaluation" : "invocation",
            through: undefined,
          });
        }
      }

      for (const call of calls.get(undefined) ?? []) {
        chargeThrough(call);
      }
    },
  };
}
