import type { BlockSyntax } from "#types/BlockSyntax";
import type { Glob, Globs } from "#types/Glob";
import { freeze } from "@auaust/toolkit/object";

export const barrelFiles: Globs = freeze(["src/**/index.ts"]);

export const barrelModules: Glob = "*.ts";

export const typescriptBlocks: BlockSyntax = freeze({
  open: "// ",
  close: "",
  padding: "\n",
});
