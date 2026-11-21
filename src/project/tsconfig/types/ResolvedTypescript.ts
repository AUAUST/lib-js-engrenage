import type { ResolvedBaseTsconfig } from "#project/tsconfig/types/ResolvedBaseTsconfig";

export interface ResolvedTypescript {
  readonly tsconfig: ResolvedBaseTsconfig;
  readonly verbatimModuleSyntax: boolean;
}
