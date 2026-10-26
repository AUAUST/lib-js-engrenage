import type { CompilerOptions } from "typescript";

import type { Accessors } from "#config/types/Accessors";
import type { Directory } from "#types/Directory";
import type { Paths } from "#typescript/types/Paths";

export type Tsconfig = Accessors<{
  compilerOptions: CompilerOptions | undefined;
  outDir: Directory | undefined;
  paths: Paths | undefined;
}>;
