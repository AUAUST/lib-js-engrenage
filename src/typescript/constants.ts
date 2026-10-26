import { freeze } from "@auaust/toolkit/object";

import type { BlockSyntax } from "#types/BlockSyntax";
import type { Glob } from "#types/Glob";

export const barrelFiles: readonly Glob[] = freeze(["src/**/index.ts"]);

export const barrelModules: Glob = "*.ts";

export const typescriptBlocks: BlockSyntax = freeze({
  open: "// ",
  close: "",
  padding: "\n",
});
