import type { BoundaryCause } from "#project/structure/types/BoundaryCause";
import type { Entity } from "#project/structure/types/Entity";
import type { LineageMember } from "#project/structure/types/LineageMember";

export interface BoundaryViolation {
  readonly cause: BoundaryCause;
  readonly importer: Entity;
  readonly target: Entity;
  readonly boundary: LineageMember | undefined;
  readonly fix: string | undefined;
}
