import { freeze } from "@auaust/toolkit/object";

import type { BlockSyntax } from "#types/BlockSyntax";

export const markdownBlocks: BlockSyntax = freeze({
  open: "<!-- ",
  close: " -->",
  padding: "\n\n",
});
