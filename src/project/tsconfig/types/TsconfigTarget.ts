import type { ManagedTsconfigFields } from "#project/tsconfig/types/ManagedTsconfigFields";
import type { TsconfigKey } from "#project/tsconfig/types/TsconfigKey";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

/**
 * A tsconfig file sync writes: the base one or an environment's in `scope`, `.`
 * for the root. A list option set to `false` leaves its field to the file, and
 * `true` or `undefined` keeps engrenage's default; `unmanaged` lists the dotted
 * paths sync never writes, and `compilerOptions` the options written after the
 * ones engrenage derives.
 */
export interface TsconfigTarget extends ManagedTsconfigFields {
  readonly key: TsconfigKey | "base";
  readonly scope: Directory;
  readonly file: File;
}
