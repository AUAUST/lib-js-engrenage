import type { Rule, Scope } from "eslint";
import type { Symbol, Node as TsNode, TypeChecker } from "typescript";

import { isString } from "@auaust/toolkit";

import {
  classNodeTypes,
  functionNodeTypes,
} from "#tools/eslint/effects/constants";
import { chargeImportBindings } from "#tools/eslint/effects/operations/chargeImportBindings";
import { chargeThrough } from "#tools/eslint/effects/operations/chargeThrough";
import { createEffectRanker } from "#tools/eslint/effects/operations/createEffectRanker";
import { createGlobalCharger } from "#tools/eslint/effects/operations/createGlobalCharger";
import { createStateCharger } from "#tools/eslint/effects/operations/createStateCharger";
import { accessesOf } from "#tools/eslint/effects/utils/accessesOf";
import { appendEntry } from "#tools/eslint/effects/utils/appendEntry";
import { runnerOf } from "#tools/eslint/effects/utils/runnerOf";
import { isTypeOnlyNode } from "#tools/eslint/utils/isTypeOnlyNode";
import type {
  EffectGlobals,
  EffectRanks,
  ResolvedEffects,
} from "#batiment/effects/index";
import type { EntityIndex } from "#batiment/structure/index";
import type { TagDeclaration } from "#project/docs/index";
import type { EffectCharge } from "#tools/eslint/effects/types/EffectCharge";
import type { EffectDeclaration } from "#tools/eslint/effects/types/EffectDeclaration";
import type { LocalCall } from "#tools/eslint/effects/types/LocalCall";
import type { PendingCharge } from "#tools/eslint/effects/types/PendingCharge";
import type { RankedUnit } from "#tools/eslint/effects/types/RankedUnit";
import type { SyntaxNode } from "#tools/eslint/effects/types/SyntaxNode";
import type { Directory } from "#types/Directory";

function isGenerator(node: SyntaxNode): boolean {
  return "generator" in node && node.generator === true;
}

/**
 * Collects what each use of an imported binding charges, by the position running
 * it: a charge belongs to the innermost function whose body runs it, and a local
 * function or class invoked while the module evaluates charges there what its
 * own body runs, through the local calls it makes in turn. A function or class
 * carrying an effect doc tag is passed to `declare`, and what its own body runs
 * at invocation carries its tag. A static member path of a global `globals` or
 * the ECMAScript data rank, reached directly or through `globalThis` or a host
 * alias `aliases` names, charges its rank once invoked and its member's rank once
 * read, as does a member path the data ranks of an external binding. A write
 * charges by who owns the state it changes, and a read of a `let` or `var` by who
 * declares it. A module a bundler erases ranks by `erased`, keyed by glob over
 * its specifier's last segment, and a module nothing resolves charges `fallback`.
 */
export function collectEffectCharges({
  context,
  entities,
  effects,
  erased,
  tags,
  globals,
  aliases,
  root,
  charge,
  declare,
}: {
  context: Rule.RuleContext;
  entities: EntityIndex;
  effects: ResolvedEffects;
  erased: EffectRanks;
  tags: readonly TagDeclaration[];
  globals: readonly EffectGlobals[];
  aliases: readonly string[];
  root: Directory;
  charge(found: EffectCharge): void;
  declare(found: EffectDeclaration): void;
}): Rule.RuleListener {
  const { sourceCode } = context;
  const services = sourceCode.parserServices;

  if (services?.program == null || services.esTreeNodeToTSNodeMap == null) {
    return {};
  }

  const { program, esTreeNodeToTSNodeMap } = services;
  const checker: TypeChecker = program.getTypeChecker();

  const {
    rankErased,
    rankUnrankable,
    rankModule,
    rankBinding,
    rankAccess,
    rankDeclared,
  } = createEffectRanker({
    program,
    checker,
    entities,
    effects,
    erased,
    tags,
    root,
  });

  const runs = new Map<SyntaxNode | undefined, PendingCharge[]>();
  const calls = new Map<SyntaxNode | undefined, LocalCall[]>();

  function append(runner: SyntaxNode | undefined, pending: PendingCharge) {
    appendEntry(runs, runner, pending);
  }

  // @debt the ESTree-to-TS node map is untyped here, so nodes are cast `as TsNode` and `as never` with no stated invariant
  function symbolOf(node: object): Symbol | undefined {
    return checker.getSymbolAtLocation(
      esTreeNodeToTSNodeMap.get(node) as TsNode,
    );
  }

  function declaredOf(runner: SyntaxNode): string | undefined {
    return rankDeclared(esTreeNodeToTSNodeMap.get(runner) as TsNode);
  }

  function creatorOf(runner: SyntaxNode): string | undefined {
    for (const ancestor of sourceCode.getAncestors(runner).toReversed()) {
      if (!(
        functionNodeTypes.includes(ancestor.type) ||
        classNodeTypes.includes(ancestor.type)
      )) {
        continue;
      }

      const level = declaredOf(ancestor);

      if (level !== undefined) {
        return level;
      }
    }
  }

  function chargeModule({
    node,
    specifier,
    loaded,
    runner,
    sideEffect = false,
  }: {
    node: SyntaxNode;
    specifier: string;
    loaded: RankedUnit | undefined;
    runner: SyntaxNode | undefined;
    sideEffect?: boolean;
  }) {
    if (loaded !== undefined) {
      append(runner, {
        node,
        operation: "evaluate",
        binding: specifier,
        sideEffect,
        hint: undefined,
        ...loaded,
      });
    }
  }

  function chargeSource(
    node: SyntaxNode,
    source: SyntaxNode & { value?: unknown },
    runner: SyntaxNode | undefined,
    sideEffect = false,
  ) {
    const specifier = String(source.value);

    chargeModule({
      node,
      specifier,
      loaded: rankErased(specifier) ?? rankModule(symbolOf(source), specifier),
      runner,
      sideEffect,
    });
  }

  function recordLocal(
    variables: readonly Scope.Variable[],
    callee: SyntaxNode,
    name: string,
  ) {
    for (const invocation of accessesOf(sourceCode, variables)) {
      if (invocation.invoked && invocation.members.length === 0) {
        appendEntry(calls, invocation.runner, {
          callee,
          node: invocation.site,
          name,
        });
      }
    }
  }

  const globalCharger = createGlobalCharger({
    sourceCode,
    effects,
    globals,
    aliases,
    append,
  });

  const stateCharger = createStateCharger({
    sourceCode,
    append,
  });

  return {
    "ImportDeclaration"(declaration) {
      if (isTypeOnlyNode(declaration)) {
        return;
      }

      chargeSource(
        declaration,
        declaration.source,
        undefined,
        declaration.specifiers.length === 0,
      );

      chargeImportBindings({
        sourceCode,
        checker,
        declaration,
        symbolOf,
        rankAccess,
        append,
      });
    },
    "ImportExpression"(expression) {
      const runner = runnerOf([
        ...sourceCode.getAncestors(expression),
        expression,
      ]);

      const { source } = expression;

      if (source.type !== "Literal" || !isString(source.value)) {
        return void chargeModule({
          node: expression,
          specifier: sourceCode.getText(source),
          loaded: rankUnrankable(),
          runner,
        });
      }

      const specifier = source.value;
      const module = symbolOf(source);

      chargeSource(expression, source, runner);

      if (module === undefined || rankErased(specifier) !== undefined) {
        return;
      }

      for (const exported of checker.getExportsOfModule(module)) {
        const ranked = rankBinding(exported, specifier, [exported.name]);

        if (ranked !== undefined) {
          append(runner, {
            node: expression,
            operation: "invoke",
            binding: exported.name,
            sideEffect: false,
            hint: undefined,
            ...ranked,
          });
        }
      }
    },
    "ExportAllDeclaration"(declaration) {
      if (!isTypeOnlyNode(declaration)) {
        chargeSource(declaration, declaration.source, undefined);
      }
    },
    "ExportNamedDeclaration"(declaration) {
      if (declaration.source != null && !isTypeOnlyNode(declaration)) {
        chargeSource(declaration, declaration.source, undefined);
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
    ":function, ClassDeclaration, ClassExpression"(node: SyntaxNode) {
      const level = declaredOf(node);

      if (level !== undefined) {
        declare({ node, level });
      }
    },
    "MetaProperty": globalCharger.meta,
    "ThisExpression": stateCharger.receiver,
    "MemberExpression": stateCharger.member,
    "Program:exit"() {
      globalCharger.charge();
      stateCharger.charge();

      for (const [runner, ran] of runs) {
        const declared = runner === undefined ? undefined : declaredOf(runner);

        const creator = runner === undefined || declared !== undefined
          ? undefined
          : creatorOf(runner);

        for (const pending of ran) {
          charge({
            ...pending,
            position: runner === undefined ? "evaluation" : "invocation",
            through: undefined,
            declared,
          });

          if (creator !== undefined && pending.hint === undefined) {
            charge({
              ...pending,
              position: "invocation",
              through: undefined,
              declared: creator,
              hint: "escape",
            });
          }
        }
      }

      for (const call of calls.get(undefined) ?? []) {
        chargeThrough({
          call,
          runs,
          calls,
          charge,
        });
      }
    },
  };
}
