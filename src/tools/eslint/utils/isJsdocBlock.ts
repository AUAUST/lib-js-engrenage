import type { SourceCode } from "eslint";

import { isJsdocComment } from "#foundation/jsdoc/index";

export function isJsdocBlock(
  comment: ReturnType<SourceCode["getAllComments"]>[number],
): boolean {
  return comment.type === "Block" && isJsdocComment(`/*${comment.value}*/`);
}
