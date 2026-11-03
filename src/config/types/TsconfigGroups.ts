import type { ResolvedEnvironmentTsconfigOption } from "#config/types/ResolvedEnvironmentTsconfigOption";
import type { TsconfigKey } from "#config/types/TsconfigKey";

export type TsconfigGroups = Readonly<
  Record<TsconfigKey, ResolvedEnvironmentTsconfigOption>
>;
