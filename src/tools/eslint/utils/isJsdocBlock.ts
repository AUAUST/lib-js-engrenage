import type { SourceCode } from "eslint";

export function isJsdocBlock(
  comment: ReturnType<SourceCode["getAllComments"]>[number],
): boolean {
  return comment.type === "Block" && comment.value.startsWith("*");
}
