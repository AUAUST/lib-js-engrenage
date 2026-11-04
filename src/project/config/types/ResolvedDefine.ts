import type { ResolvedGlobals } from "#project/config/types/ResolvedGlobals";

export interface ResolvedDefine {
  readonly types: boolean;
  readonly values: ResolvedGlobals;
}
