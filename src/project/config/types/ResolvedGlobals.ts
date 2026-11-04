import type { ResolvedGlobal } from "#config/types/ResolvedGlobal";

export interface ResolvedGlobals {
  readonly [name: string]: ResolvedGlobal;
}
