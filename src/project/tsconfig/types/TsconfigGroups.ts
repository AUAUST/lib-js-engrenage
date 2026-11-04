import type { ResolvedEnvironmentTsconfigOption } from "#tsconfig/types/ResolvedEnvironmentTsconfigOption";
import type { TsconfigKey } from "#tsconfig/types/TsconfigKey";

export type TsconfigGroups = Readonly<
  Record<TsconfigKey, ResolvedEnvironmentTsconfigOption>
>;
