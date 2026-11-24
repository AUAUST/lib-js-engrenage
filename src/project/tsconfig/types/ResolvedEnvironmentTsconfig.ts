import type { ManagedTsconfigFields } from "#project/tsconfig/types/ManagedTsconfigFields";
import type { File } from "#types/File";

export interface ResolvedEnvironmentTsconfig extends ManagedTsconfigFields {
  readonly file: File | undefined;
  readonly check: boolean;
  readonly path: Promise<File | undefined>;
}
