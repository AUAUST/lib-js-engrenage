import type { Globs } from "#types/Globs";

export interface ResolvedTestsPatterns {
  readonly plain: Globs;
  readonly source: Globs;
  readonly dist: Globs;
}
