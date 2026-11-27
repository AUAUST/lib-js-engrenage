import type { SourceCode } from "eslint";

import {
  rankGlobal,
  type EffectGlobals,
  type ResolvedEffects,
} from "#batiment/effects/index";
import {
  ecmascriptGlobals,
  globalObject,
  typeNodeTypes,
} from "#tools/eslint/effects/constants";
import { accessOf } from "#tools/eslint/effects/utils/accessOf";
import type { PendingCharge } from "#tools/eslint/effects/types/PendingCharge";
import type { SyntaxNode } from "#tools/eslint/effects/types/SyntaxNode";

/**
 * Collects the `import.meta` uses `meta` is passed and, once `charge` runs,
 * passes to `append` what each use of a global charges, by the function or class
 * running it: a static member path `globals` or the ECMAScript data rank, reached
 * directly or through `globalThis` or a host alias `aliases` names, charges its
 * rank once invoked and its member's rank once read.
 */
export function createGlobalCharger({
  sourceCode,
  effects,
  globals,
  aliases,
  append,
}: {
  sourceCode: SourceCode;
  effects: ResolvedEffects;
  globals: readonly EffectGlobals[];
  aliases: readonly string[];
  append(runner: SyntaxNode | undefined, pending: PendingCharge): void;
}) {
  const hosts = new Set([globalObject, ...aliases]);
  const sources = [...globals, ecmascriptGlobals];
  const roots: SyntaxNode[] = [];

  function chargeGlobal(root: SyntaxNode, name: string) {
    const ancestors = sourceCode.getAncestors(root);

    if (ancestors.some(({ type }) => typeNodeTypes.has(type))) {
      return;
    }

    const access = accessOf(ancestors, root);

    if (access === undefined) {
      return;
    }

    const written = [...name.split("."), ...access.members];

    let path = written;

    while (path.length > 1 && hosts.has(path[0] ?? "")) {
      path = path.slice(1);
    }

    const ranked = rankGlobal(effects, sources, path);
    // @debt a read takes the rank of a member key alone, so reading a ranked method without calling it (`const now = Date.now`) charges what calling it does
    const level = access.invoked ? ranked?.level : ranked?.member;

    if (level !== undefined) {
      append(access.runner, {
        node: access.site,
        operation: access.invoked ? "invoke" : "read",
        sideEffect: false,
        hint: undefined,
        binding: written.join("."),
        unit: `the global \`${path[0] ?? name}\``,
        target: { evaluation: effects.levels[0], invocation: level },
      });
    }
  }

  function meta(property: SyntaxNode) {
    if (
      property.type === "MetaProperty" &&
      property.meta.name === "import" &&
      property.property.name === "meta"
    ) {
      roots.push(property);
    }
  }

  function charge() {
    const scope = sourceCode.scopeManager?.globalScope;

    if (scope == null) {
      return;
    }

    const references = [
      ...scope.through,
      ...scope.variables.flatMap(({ defs, references: used }) => {
        return defs.length === 0 ? used : [];
      }),
    ];

    for (const { identifier } of references) {
      if (identifier.type === "Identifier") {
        chargeGlobal(identifier, identifier.name);
      }
    }

    for (const root of roots) {
      chargeGlobal(root, "import.meta");
    }
  }

  return {
    meta,
    charge,
  };
}
