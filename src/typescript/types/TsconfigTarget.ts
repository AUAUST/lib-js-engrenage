import type { ManagedListOption } from "#config/types/ManagedListOption";
import type { TsconfigKey } from "#config/types/TsconfigKey";
import type { File } from "#types/File";

export interface TsconfigTarget {
  readonly key: TsconfigKey | "base";
  readonly file: File;
  readonly extends: ManagedListOption<string> | undefined;
  readonly include: ManagedListOption<string> | undefined;
  readonly lib: ManagedListOption<string> | undefined;
  readonly types: ManagedListOption<string> | undefined;
  readonly compilerOptions: Readonly<Record<string, unknown>>;
  readonly unmanaged: readonly string[];
}
