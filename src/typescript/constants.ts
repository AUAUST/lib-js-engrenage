import { freeze } from "@auaust/toolkit/object";

import type { BlockSyntax } from "#types/BlockSyntax";
import type { Glob } from "#types/Glob";

export const barrelFiles = "**/index.ts" satisfies Glob;

export const declarationExtension = ".d.ts";

export const identifierPattern = /^[$A-Z_a-z][\w$]*$/;

export const noInputsDiagnostic = 18_003;

export const typescriptBlocks = freeze({
  open: "// ",
  close: "",
  padding: "\n",
} as const) satisfies BlockSyntax;
