import type { ResolvedGlobals } from "#project/config/index";

export interface ResolvedDefine {
  readonly types: boolean;
  readonly values: ResolvedGlobals;
}
