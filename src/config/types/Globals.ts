import type { GlobalValue } from "#config/types/GlobalValue";

export interface Globals {
  readonly [name: string]: GlobalValue;
}
