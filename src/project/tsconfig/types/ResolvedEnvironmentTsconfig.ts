import type { ManagedTsconfigFields } from "#project/tsconfig/types/ManagedTsconfigFields";
import type { TsconfigKey } from "#project/tsconfig/types/TsconfigKey";
import type { File } from "#types/File";

export interface ResolvedEnvironmentTsconfig extends ManagedTsconfigFields {
  readonly owner: TsconfigKey | undefined;
  readonly file: File | undefined;
  readonly check: boolean;
  readonly path: Promise<File | undefined>;
}
