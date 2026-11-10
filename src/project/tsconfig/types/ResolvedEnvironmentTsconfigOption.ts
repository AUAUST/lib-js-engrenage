import type { ManagedEnvironmentTsconfig } from "#project/tsconfig/types/ManagedEnvironmentTsconfig";
import type { UnmanagedEnvironmentTsconfig } from "#project/tsconfig/types/UnmanagedEnvironmentTsconfig";

export type ResolvedEnvironmentTsconfigOption =
  | ManagedEnvironmentTsconfig
  | UnmanagedEnvironmentTsconfig;
