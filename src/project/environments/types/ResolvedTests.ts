import type { Runtime } from "#project/baseline/types/Runtime";
import type { ResolvedCodeEnvironment } from "#project/environments/types/ResolvedCodeEnvironment";
import type { ResolvedTestsPatterns } from "#project/environments/types/ResolvedTestsPatterns";
import type { TestsLayout } from "#project/structure/types/TestsLayout";
import type { ResolvedEnvironmentTsconfig } from "#project/tsconfig/types/ResolvedEnvironmentTsconfig";
import type { Directory } from "#types/Directory";
import type { Globs } from "#types/Globs";

export interface ResolvedTests extends ResolvedCodeEnvironment {
  readonly layout: TestsLayout;
  readonly patterns: ResolvedTestsPatterns;
  readonly files: Globs;
  readonly fixtures: Globs;
  readonly coverageDir: Directory;
  readonly dist: { readonly tsconfig: ResolvedEnvironmentTsconfig };
  readonly runtime: Extract<Runtime, { kind: "node" }>;
}
