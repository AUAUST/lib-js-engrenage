import type { Runtime } from "#project/baseline/index";
import type { ResolvedCodeEnvironment } from "#project/environments/types/ResolvedCodeEnvironment";
import type { ResolvedTestsPatterns } from "#project/environments/types/ResolvedTestsPatterns";
import type { ResolvedEnvironmentTsconfig } from "#project/tsconfig/index";
import type { Directory } from "#types/Directory";
import type { Globs } from "#types/Globs";

export interface ResolvedTests extends ResolvedCodeEnvironment {
  readonly mirror: boolean;
  readonly patterns: ResolvedTestsPatterns;
  readonly files: Globs;
  readonly fixtures: Globs;
  readonly coverageDir: Directory;
  readonly dist: { readonly tsconfig: ResolvedEnvironmentTsconfig };
  readonly runtime: Extract<Runtime, { kind: "node" }>;
}
