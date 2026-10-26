import { freeze } from "@auaust/toolkit/object";

import type { BlockSyntax } from "#types/BlockSyntax";
import type { Glob } from "#types/Glob";

export const barrelFiles: Glob = "**/index.ts";

export const declarationExtension = ".d.ts";

export const noInputsDiagnostic = 18003;

export const typescriptBlocks: BlockSyntax = freeze({
  open: "// ",
  close: "",
  padding: "\n",
});
