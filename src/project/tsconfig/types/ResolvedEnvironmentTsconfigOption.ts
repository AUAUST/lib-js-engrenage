import type { ManagedEnvironmentTsconfig } from "#tsconfig/types/ManagedEnvironmentTsconfig";
import type { UnmanagedEnvironmentTsconfig } from "#tsconfig/types/UnmanagedEnvironmentTsconfig";

export type ResolvedEnvironmentTsconfigOption =
  ManagedEnvironmentTsconfig | UnmanagedEnvironmentTsconfig;
