import type { ManagedEnvironmentTsconfig } from "#project/tsconfig/types/ManagedEnvironmentTsconfig";
import type { TsconfigKey } from "#project/tsconfig/types/TsconfigKey";

export interface TsconfigOwner {
  readonly key: TsconfigKey;
  readonly group: ManagedEnvironmentTsconfig;
}
