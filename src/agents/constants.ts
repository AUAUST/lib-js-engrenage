import { freeze } from "@auaust/toolkit/object";

import type { BlockSyntax } from "#types/BlockSyntax";

export const markdownBlocks = freeze({
  open: "<!-- ",
  close: " -->",
  padding: "\n\n",
} as const) satisfies BlockSyntax;
