import type { LocatedResource } from "#project/config/types/LocatedResource";

export interface ResolvedResources {
  list(): readonly LocatedResource[];
  get(name: string): LocatedResource | undefined;
  path(name: string): string;
}
