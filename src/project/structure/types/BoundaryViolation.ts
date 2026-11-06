import type { BoundaryCause } from "#project/structure/types/BoundaryCause";
import type { ImportCategory } from "#project/structure/types/ImportCategory";
import type { LineageMember } from "#project/structure/types/LineageMember";

export interface BoundaryViolation {
  readonly cause: BoundaryCause;
  readonly boundary: LineageMember | undefined;
  readonly fix: string | undefined;
  readonly category?: ImportCategory;
}
