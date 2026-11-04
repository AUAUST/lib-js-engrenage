import type { Runtime } from "#baseline/types/Runtime";
import type { ResolvedCodeEnvironment } from "#environments/types/ResolvedCodeEnvironment";
import type { ResolvedTestsPatterns } from "#environments/types/ResolvedTestsPatterns";
import type { ResolvedEnvironmentTsconfig } from "#tsconfig/types/ResolvedEnvironmentTsconfig";
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
