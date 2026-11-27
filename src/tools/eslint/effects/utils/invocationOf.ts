import { isString } from "@auaust/toolkit";

import { classNodeTypes } from "#tools/eslint/effects/constants";
import { isInvokedBy } from "#tools/eslint/effects/utils/isInvokedBy";
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
 * The node invoking `identifier`, `ancestors` its ancestors, directly or through
 * the static members it names, with the function or class running that invocation;
 * `undefined` when the reference only reads it.
 */
export function invocationOf(
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

    if (parent.type === "MemberExpression" && parent.object === child) {
      const name = memberName(parent);

      if (name === undefined) {
        return;
      }

      members.push(name);
    } else if (!transparentTypes.has(parent.type)) {
      if (!isInvokedBy(parent, child)) {
        return;
      }

      return {
        site: parent,
        members,
        runner: classNodeTypes.includes(parent.type)
          ? parent
          : runnerOf(ancestors.slice(0, index + 1)),
      };
    }

    child = parent;
  }
}
