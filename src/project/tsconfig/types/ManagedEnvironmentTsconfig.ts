import type { ManagedTsconfigFields } from "#project/tsconfig/types/ManagedTsconfigFields";
import type { File } from "#types/File";

export interface ManagedEnvironmentTsconfig extends ManagedTsconfigFields {
  readonly enabled: true;
  readonly path: File | undefined;
  readonly check: boolean;
}
