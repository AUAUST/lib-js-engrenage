import { freeze } from "@auaust/toolkit/object";

import type { BlockSyntax } from "#types/BlockSyntax";
import type { Glob } from "#types/Glob";

export const barrelFiles = "**/index.ts" satisfies Glob;

export const declarationExtension = ".d.ts";

export const identifierPattern = freeze(/^[$A-Z_a-z][\w$]*$/);

export const typescriptBlocks = freeze({
  open: "// ",
  close: "",
  padding: "\n",
} as const) satisfies BlockSyntax;
