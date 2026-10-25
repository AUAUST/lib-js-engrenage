import type { BlockSyntax } from "#types/BlockSyntax";

export const markdownBlocks: BlockSyntax = {
  open: "<!-- ",
  close: " -->",
  padding: "\n\n",
};
