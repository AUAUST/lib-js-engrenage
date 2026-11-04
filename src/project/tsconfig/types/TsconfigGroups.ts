import type { ResolvedEnvironmentTsconfigOption } from "#project/tsconfig/types/ResolvedEnvironmentTsconfigOption";
import type { TsconfigKey } from "#project/tsconfig/types/TsconfigKey";

export type TsconfigGroups = Readonly<
  Record<TsconfigKey, ResolvedEnvironmentTsconfigOption>
>;
