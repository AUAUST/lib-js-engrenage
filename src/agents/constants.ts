import type { BlockSyntax } from "#types/BlockSyntax";
import { freeze } from "@auaust/toolkit/object";

export const markdownBlocks: BlockSyntax = freeze({
  open: "<!-- ",
  close: " -->",
  padding: "\n\n",
});
