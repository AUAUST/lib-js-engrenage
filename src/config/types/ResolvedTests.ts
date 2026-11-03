import type { ResolvedCodeEnvironment } from "#config/types/ResolvedCodeEnvironment";
import type { ResolvedEnvironmentTsconfig } from "#config/types/ResolvedEnvironmentTsconfig";
import type { ResolvedTestsPatterns } from "#config/types/ResolvedTestsPatterns";
import type { Runtime } from "#config/types/Runtime";
import type { Directory } from "#types/Directory";
import type { Globs } from "#types/Globs";

export interface ResolvedTests extends ResolvedCodeEnvironment {
  readonly patterns: ResolvedTestsPatterns;
  readonly files: Globs;
  readonly fixtures: Globs;
  readonly coverageDir: Directory;
  readonly dist: { readonly tsconfig: ResolvedEnvironmentTsconfig };
  readonly runtime: Extract<Runtime, { kind: "node" }>;
}
