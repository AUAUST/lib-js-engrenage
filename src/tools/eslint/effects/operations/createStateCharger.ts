import type { Scope, SourceCode } from "eslint";

import { isObject } from "@auaust/toolkit";

import { stateUnits, typeNodeTypes } from "#tools/eslint/effects/constants";
import { isWritten } from "#tools/eslint/effects/utils/isWritten";
import { runnerOf } from "#tools/eslint/effects/utils/runnerOf";
import type { EffectState } from "#batiment/effects/index";
import type { PendingCharge } from "#tools/eslint/effects/types/PendingCharge";
import type { SyntaxNode } from "#tools/eslint/effects/types/SyntaxNode";

const transparentTypes: ReadonlySet<string> = new Set([
  "ChainExpression",
  "TSNonNullExpression",
  "TSAsExpression",
  "TSSatisfiesExpression",
  "TSTypeAssertion",
]);

const reassignableKinds: ReadonlySet<string> = new Set(["let", "var"]);

const freshTypes: ReadonlySet<string> = new Set([
  "ObjectExpression",
  "ArrayExpression",
  "NewExpression",
  "Literal",
  "TemplateLiteral",
  "FunctionExpression",
  "ArrowFunctionExpression",
  "ClassExpression",
]);

const unitScopeTypes: ReadonlySet<string> = new Set(["module", "global"]);

const exportTypes: ReadonlySet<string> = new Set([
  "ExportNamedDeclaration",
  "ExportDefaultDeclaration",
  "ExportSpecifier",
]);

/**
 * The root a write's state belongs to: a variable, `null` for a free name,
 * or a `this` expression.
 */
type StateRoot = { variable: Scope.Variable | null } | { receiver: SyntaxNode };

/**
 * Collects the `this` expressions `receiver` is passed and, once `charge` runs,
 * passes to `append` what each read and write of state charges, by the function
 * or class running it: a write by who owns the state it changes, the root of a
 * `const` alias or loop variable followed to what its initializer or iterated
 * expression names, and a read of a `let` or `var` by who declares it. A write
 * to its own variable holding a value a call result or a reassignment hides is
 * hinted as `hidden`, charged as writing state outside its module.
 */
export function createStateCharger({
  sourceCode,
  append,
}: {
  sourceCode: SourceCode;
  append(runner: SyntaxNode | undefined, pending: PendingCharge): void;
}) {
  const receivers: SyntaxNode[] = [];
  const references = new Map<object, Scope.Reference>();

  function chainOf(node: SyntaxNode): SyntaxNode[] {
    return [...sourceCode.getAncestors(node), node];
  }

  function runnerOfScope(scope: Scope.Scope): SyntaxNode | undefined {
    if (unitScopeTypes.has(scope.type)) {
      return;
    }

    const { block } = scope;

    return runnerOf(
      block.type === "FunctionDeclaration" ||
        block.type === "FunctionExpression" ||
        block.type === "ArrowFunctionExpression"
        ? [...chainOf(block), block.body]
        : chainOf(block),
    );
  }

  function isExported(variable: Scope.Variable): boolean {
    return (
      variable.defs.some((definition) => {
        const declaration = definition.type === "Variable"
          ? definition.parent
          : definition.node;

        return exportTypes.has(
          sourceCode.getAncestors(declaration).at(-1)?.type ?? "",
        );
      }) ||
      variable.references.some(({ identifier }) => {
        return (
          identifier.type === "Identifier" &&
          exportTypes.has(
            sourceCode.getAncestors(identifier).at(-1)?.type ?? "",
          )
        );
      })
    );
  }

  function stateOfVariable(
    variable: Scope.Variable | null,
    runner: SyntaxNode | undefined,
    reached: boolean,
  ): EffectState {
    if (
      variable === null ||
      (variable.scope.type === "global" &&
        variable.defs.every(({ type }) => type === "ImplicitGlobalVariable")) ||
      variable.defs.some(({ type }) => type === "ImportBinding")
    ) {
      return "external";
    }

    const { variableScope } = variable.scope;

    if (unitScopeTypes.has(variableScope.type)) {
      return isExported(variable) ? "unit-shared" : "unit-private";
    }

    if (runnerOfScope(variableScope) !== runner) {
      return "closure";
    }

    const [definition] = variable.defs;

    return reached &&
      (definition === undefined ||
        definition.type === "Parameter" ||
        definition.type === "CatchClause")
      ? "received"
      : "own";
  }

  function stateOfReceiver(receiver: SyntaxNode): EffectState {
    const ancestors = sourceCode.getAncestors(receiver);

    for (let index = ancestors.length - 1; index >= 0; index -= 1) {
      const ancestor = ancestors[index];

      if (ancestor === undefined) {
        break;
      }

      if (
        ancestor.type === "FunctionDeclaration" ||
        ancestor.type === "FunctionExpression"
      ) {
        const method = ancestors[index - 1];

        // @debt `this` in a function other than a class member counts as received, though a function bound or called as a constructor owns it
        if (method?.type !== "MethodDefinition") {
          return "received";
        }

        return method.kind === "constructor"
          ? "own"
          : method.static
            ? "unit-private"
            : "received";
      }

      if (ancestor.type === "StaticBlock") {
        return "unit-private";
      }

      const type: string = ancestor.type;

      if (
        (type === "PropertyDefinition" || type === "AccessorProperty") &&
        "value" in ancestor &&
        ancestor.value === (ancestors[index + 1] ?? receiver)
      ) {
        return "static" in ancestor && ancestor.static ? "unit-private" : "own";
      }
    }

    return "own";
  }

  function isFresh(expression: SyntaxNode | null | undefined): boolean {
    let node = expression;

    while (
      node != null &&
      transparentTypes.has(node.type) &&
      "expression" in node &&
      isObject(node.expression)
    ) {
      node = node.expression;
    }

    return node != null && freshTypes.has(node.type);
  }

  function hiddenOf(
    variable: Scope.Variable | null,
  ): Scope.Variable | undefined {
    const definition = variable?.defs[0];

    if (variable === null || definition?.type !== "Variable") {
      return;
    }

    const hidden = reassignableKinds.has(definition.parent.kind)
      ? variable.references.some(({ writeExpr }) => {
          return writeExpr != null && !isFresh(writeExpr);
        })
      : !isFresh(definition.node.init);

    return hidden ? variable : undefined;
  }

  function pathRoot(expression: SyntaxNode): SyntaxNode | undefined {
    let node = expression;

    for (;;) {
      if (node.type === "Identifier" || node.type === "ThisExpression") {
        return node;
      }

      if (
        node.type === "MemberExpression" &&
        (!node.computed || node.property.type === "Literal")
      ) {
        node = node.object;
      } else if (
        transparentTypes.has(node.type) &&
        "expression" in node &&
        isObject(node.expression)
      ) {
        node = node.expression;
      } else {
        return;
      }
    }
  }

  function aliasedOf(variable: Scope.Variable): SyntaxNode | undefined {
    const [definition, ...others] = variable.defs;

    if (
      definition?.type !== "Variable" ||
      others.length > 0 ||
      definition.parent.kind !== "const"
    ) {
      return;
    }

    const declarator = definition.node;

    const leaf = sourceCode
      .getAncestors(definition.name)
      .slice(sourceCode.getAncestors(declarator).length + 1);

    if (
      leaf.some(({ type }) => {
        return type === "AssignmentPattern" || type === "RestElement";
      })
    ) {
      return;
    }

    if (declarator.init != null) {
      return pathRoot(declarator.init);
    }

    const loop = sourceCode.getAncestors(definition.parent).at(-1);

    return (loop?.type === "ForOfStatement" ||
      loop?.type === "ForInStatement") &&
      loop.left === definition.parent
      ? pathRoot(loop.right)
      : undefined;
  }

  function rootOf(variable: Scope.Variable | null): StateRoot {
    const seen = new Set<Scope.Variable>();

    let root: Scope.Variable | null = variable;

    while (root !== null && !seen.has(root)) {
      seen.add(root);

      const aliased = aliasedOf(root);

      if (aliased === undefined) {
        break;
      }

      if (aliased.type === "ThisExpression") {
        return { receiver: aliased };
      }

      const reference = references.get(aliased);

      if (reference === undefined) {
        break;
      }

      root = reference.resolved;
    }

    return { variable: root };
  }

  function chargeWrite(node: SyntaxNode, variable?: Scope.Variable | null) {
    const ancestors = sourceCode.getAncestors(node);

    let site = node;
    let reached = false;

    for (let index = ancestors.length - 1; index >= 0; index -= 1) {
      const parent = ancestors[index];

      if (parent === undefined) {
        return;
      }

      if (parent.type === "MemberExpression" && parent.object === site) {
        reached = true;
      } else if (!transparentTypes.has(parent.type)) {
        if (!isWritten([...ancestors.slice(0, index + 1), site])) {
          return;
        }

        break;
      }

      site = parent;
    }

    const runner = runnerOf([...ancestors, node]);

    const root = variable === undefined
      ? { receiver: node }
      : reached
        ? rootOf(variable)
        : { variable };

    const state = "receiver" in root
      ? stateOfReceiver(root.receiver)
      : stateOfVariable(root.variable, runner, reached);

    // @debt a write rooted in no variable, such as `pick(param).x = 1` or `(a ? b : c).x = 1`, is neither charged nor hinted
    const hidden = reached && state === "own" && "variable" in root
      ? hiddenOf(root.variable)
      : undefined;

    append(runner, {
      node: site,
      operation: "write",
      sideEffect: false,
      hint: hidden === undefined ? undefined : "hidden",
      binding: sourceCode.getText(site),
      unit: hidden === undefined
        ? stateUnits[state]
        : `the value \`${hidden.name}\` holds`,
      target: { state: hidden === undefined ? state : "external" },
    });
  }

  function chargeRead(
    reference: Scope.Reference,
    identifier: SyntaxNode,
    name: string,
  ) {
    const { resolved } = reference;

    if (
      resolved === null ||
      !reference.isRead() ||
      !resolved.defs.some((definition) => {
        return (
          definition.type === "Variable" &&
          reassignableKinds.has(definition.parent.kind)
        );
      })
    ) {
      return;
    }

    const runner = runnerOf(chainOf(identifier));
    const state = stateOfVariable(resolved, runner, false);

    append(runner, {
      node: identifier,
      operation: "read",
      sideEffect: false,
      hint: undefined,
      binding: name,
      unit: stateUnits[state],
      target: { state },
    });
  }

  function receiver(node: SyntaxNode) {
    receivers.push(node);
  }

  function charge() {
    const scopes = sourceCode.scopeManager?.scopes ?? [];

    for (const scope of scopes) {
      for (const reference of scope.references) {
        references.set(reference.identifier, reference);
      }
    }

    for (const reference of references.values()) {
      const { identifier } = reference;

      if (
        identifier.type !== "Identifier" ||
        sourceCode.getAncestors(identifier).some(({ type }) => {
          return typeNodeTypes.has(type);
        })
      ) {
        continue;
      }

      chargeWrite(identifier, reference.resolved);
      chargeRead(reference, identifier, identifier.name);
    }

    for (const node of receivers) {
      chargeWrite(node);
    }
  }

  return {
    receiver,
    charge,
  };
}
