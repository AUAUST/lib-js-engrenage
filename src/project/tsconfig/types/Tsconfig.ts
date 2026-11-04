import type { CompilerOptions } from "typescript";

import type { Accessors } from "#config/types/Accessors";
import type { Paths } from "#tsconfig/types/Paths";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export type Tsconfig = Accessors<{
  compilerOptions: CompilerOptions | undefined;
  outDir: Directory | undefined;
  paths: Paths | undefined;
  references: readonly File[];
}>;
