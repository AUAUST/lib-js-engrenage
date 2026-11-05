import type { ManagedListOption } from "#foundation/options/index";
import type { File } from "#types/File";

export interface ResolvedBaseTsconfig {
  readonly file: File;
  readonly extends: ManagedListOption<string> | undefined;
  readonly compilerOptions: Readonly<Record<string, unknown>>;
  readonly unmanaged: readonly string[];
  readonly path: File | undefined;
}
