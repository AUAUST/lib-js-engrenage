import type { EnvironmentTsconfig } from "#config/types/EnvironmentTsconfig";
import type { TsconfigKey } from "#config/types/TsconfigKey";

export type TsconfigGroups = Readonly<
  Record<TsconfigKey, EnvironmentTsconfig | false | undefined>
>;
