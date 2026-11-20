import type { ResolvedBaseTsconfig } from "#project/tsconfig/types/ResolvedBaseTsconfig";
import type { Globs } from "#types/Globs";

export interface ResolvedTypescript {
  readonly tsconfig: ResolvedBaseTsconfig;
  readonly files: Globs;
  readonly verbatimModuleSyntax: boolean;
}
