import { isString } from "@auaust/toolkit";

import { classNodeTypes } from "#tools/eslint/effects/constants";
import { isInvokedBy } from "#tools/eslint/effects/utils/isInvokedBy";
import { isWritten } from "#tools/eslint/effects/utils/isWritten";
import { runnerOf } from "#tools/eslint/effects/utils/runnerOf";
import type { SyntaxNode } from "#tools/eslint/effects/types/SyntaxNode";

const transparentTypes: ReadonlySet<string> = new Set([
  "ChainExpression",
  "TSNonNullExpression",
]);

function memberName(member: SyntaxNode): string | undefined {
  if (member.type !== "MemberExpression") {
    return;
  }

  const { computed, property } = member;

  if (!computed && property.type === "Identifier") {
    return property.name;
  }

  return computed && property.type === "Literal" && isString(property.value)
    ? property.value
    : undefined;
}

/**
 * How `identifier`, `ancestors` its ancestors, is used through the static
 * members it names: the outermost node naming them, whether it is invoked, and
 * the function or class running that use; `undefined` when it is written.
 */
export function accessOf(
  ancestors: readonly SyntaxNode[],
  identifier: SyntaxNode,
) {
  const members: string[] = [];

  let child = identifier;

  for (let index = ancestors.length - 1; index >= 0; index -= 1) {
    const parent = ancestors[index];

    if (parent === undefined) {
      return;
    }

    const named = parent.type === "MemberExpression" && parent.object === child;
    const name = named ? memberName(parent) : undefined;

    if (name !== undefined) {
      members.push(name);
    } else if (named || !transparentTypes.has(parent.type)) {
      if (isWritten([...ancestors.slice(0, index + 1), child])) {
        return;
      }

      const invoked = isInvokedBy(parent, child);

      return {
        site: invoked ? parent : child,
        members,
        invoked,
        runner: invoked && classNodeTypes.includes(parent.type)
          ? parent
          : runnerOf([...ancestors.slice(0, index + 1), child]),
      };
    }

    child = parent;
  }
}
