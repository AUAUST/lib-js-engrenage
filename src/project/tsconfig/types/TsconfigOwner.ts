import type { ManagedEnvironmentTsconfig } from "#tsconfig/types/ManagedEnvironmentTsconfig";
import type { TsconfigKey } from "#tsconfig/types/TsconfigKey";

export interface TsconfigOwner {
  readonly key: TsconfigKey;
  readonly group: ManagedEnvironmentTsconfig;
}
