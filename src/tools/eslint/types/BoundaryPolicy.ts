import type { BoundaryDependency } from "#tools/eslint/types/BoundaryDependency";
import type { BoundaryEntity } from "#tools/eslint/types/BoundaryEntity";

export interface BoundaryPolicy {
  from: BoundaryEntity;
  allow?: BoundaryDependency;
  disallow?: BoundaryDependency;
  message?: string;
}
