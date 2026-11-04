import type { BoundaryEntity } from "#tools/eslint/types/BoundaryEntity";

export interface BoundaryDependency {
  to?: BoundaryEntity | BoundaryEntity[];
  dependency?: { source?: string[]; kind?: "type" };
}
