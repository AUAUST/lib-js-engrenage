import type { LocatedResource } from "#project/config/types/LocatedResource";

export interface ResolvedResources {
  list(flags?: {
    readonly committed?: boolean;
    readonly generated?: boolean;
    readonly formatted?: boolean;
  }): readonly LocatedResource[];
  get(name: string): LocatedResource | undefined;
  path(name: string): string;
}
