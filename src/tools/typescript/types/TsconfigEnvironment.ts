import type { ResolvedEnvironment } from "#project/environments/index";
import type { ResolvedEnvironmentTsconfig } from "#project/tsconfig/index";
import type { Globs } from "#types/Globs";

export interface TsconfigEnvironment extends ResolvedEnvironment {
  readonly globs: Globs;
  readonly tsconfig: ResolvedEnvironmentTsconfig;
}
