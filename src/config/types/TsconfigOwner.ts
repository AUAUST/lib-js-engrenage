import type { ManagedEnvironmentTsconfig } from "#config/types/ManagedEnvironmentTsconfig";
import type { TsconfigKey } from "#config/types/TsconfigKey";

export interface TsconfigOwner {
  readonly key: TsconfigKey;
  readonly group: ManagedEnvironmentTsconfig;
}
