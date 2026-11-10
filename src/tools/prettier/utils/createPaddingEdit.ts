import type { TSESTree } from "@typescript-eslint/types";

import { findLast } from "@auaust/primitive-kit/arrays";

import type { LayoutEdit } from "#tools/prettier/types/LayoutEdit";

function findPaddedLine(
  program: TSESTree.Program,
  text: string,
  previous: TSESTree.Node,
  next: TSESTree.Node,
): number {
  const comments: readonly TSESTree.Comment[] = program.comments ?? [];

  const trailingComment = findLast(comments, (comment) => {
    return (
      comment.range[0] >= previous.range[1] &&
      comment.range[0] < next.range[0] &&
      comment.loc.start.line === previous.loc.end.line
    );
  });

  const lineEnd = text.indexOf(
    "\n",
    trailingComment?.range[1] ?? previous.range[1],
  );

  if (lineEnd === -1 || lineEnd > next.range[0]) {
    return next.range[0];
  }

  const content = /\S/gu;

  content.lastIndex = lineEnd;

  return content.exec(text)?.index ?? next.range[0];
}

export function createPaddingEdit(
  program: TSESTree.Program,
  text: string,
  previous: TSESTree.Node,
  next: TSESTree.Node,
): LayoutEdit {
  return {
    kind: "blank-line",
    offset: findPaddedLine(program, text, previous, next),
    present: true,
  };
}
