import type { ManagedEnvironmentTsconfig } from "#config/types/ManagedEnvironmentTsconfig";
import type { UnmanagedEnvironmentTsconfig } from "#config/types/UnmanagedEnvironmentTsconfig";

export type ResolvedEnvironmentTsconfigOption =
  ManagedEnvironmentTsconfig | UnmanagedEnvironmentTsconfig;
