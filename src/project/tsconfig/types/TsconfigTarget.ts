import type { ManagedTsconfigFields } from "#project/tsconfig/types/ManagedTsconfigFields";
import type { TsconfigKey } from "#project/tsconfig/types/TsconfigKey";
import type { File } from "#types/File";

/**
 * A tsconfig file sync writes: the base one or an environment's. A list option
 * set to `false` leaves its field to the file, and `true` or `undefined` keeps
 * engrenage's default; `unmanaged` lists the dotted paths sync never writes, and
 * `compilerOptions` the options written after the ones engrenage derives.
 */
export interface TsconfigTarget extends ManagedTsconfigFields {
  readonly key: TsconfigKey | "base";
  readonly file: File;
}
