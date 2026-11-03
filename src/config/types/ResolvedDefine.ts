import type { ResolvedGlobals } from "#config/types/ResolvedGlobals";

export interface ResolvedDefine {
  readonly types: boolean;
  readonly values: ResolvedGlobals;
}
