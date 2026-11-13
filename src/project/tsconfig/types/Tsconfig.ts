import type { CompilerOptions } from "typescript";

import type { Accessors } from "#foundation/options/index";
import type { Paths } from "#project/tsconfig/types/Paths";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

/**
 * The project's tsconfig, parsed on first access with its `extends` chain read
 * through the staging filesystem. A field read directly throws when no tsconfig
 * is found or it leaves the field unset; its counterpart under `optional` is
 * `undefined` instead. `outDir` is relative to the project root and throws when
 * it is the root itself; `references` lists the referenced projects' paths, empty
 * when there are none.
 */
export type Tsconfig = Accessors<{
  compilerOptions: CompilerOptions | undefined;
  outDir: Directory | undefined;
  paths: Paths | undefined;
  references: readonly File[];
}>;
