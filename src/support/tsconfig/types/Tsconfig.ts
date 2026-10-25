import type { CompilerOptions } from "typescript";

import type { Accessors } from "#support/accessors/types/Accessors";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Paths } from "#typescript/types/Paths";

export type Tsconfig = Accessors<{
  path: File | undefined;
  compilerOptions: CompilerOptions | undefined;
  outDir: Directory | undefined;
  paths: Paths | undefined;
}>;
