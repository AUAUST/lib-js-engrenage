import type { ResolvedGlobal } from "#project/config/types/ResolvedGlobal";

export interface ResolvedGlobals {
  readonly [name: string]: ResolvedGlobal;
}
