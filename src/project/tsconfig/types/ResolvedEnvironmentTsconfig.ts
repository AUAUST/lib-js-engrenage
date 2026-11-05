import type { ManagedListOption } from "#foundation/options/index";
import type { TsconfigKey } from "#project/tsconfig/types/TsconfigKey";
import type { File } from "#types/File";

export interface ResolvedEnvironmentTsconfig {
  readonly owner: TsconfigKey | undefined;
  readonly file: File | undefined;
  readonly extends: ManagedListOption<string> | undefined;
  readonly include: ManagedListOption<string> | undefined;
  readonly exclude: ManagedListOption<string> | undefined;
  readonly lib: ManagedListOption<string> | undefined;
  readonly types: ManagedListOption<string> | undefined;
  readonly compilerOptions: Readonly<Record<string, unknown>>;
  readonly unmanaged: readonly string[];
  readonly check: boolean;
  readonly path: Promise<File | undefined>;
}
