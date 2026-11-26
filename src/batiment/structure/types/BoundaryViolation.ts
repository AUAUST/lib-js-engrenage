import type { BoundaryCause } from "#batiment/structure/types/BoundaryCause";
import type { ImportCategory } from "#batiment/structure/types/ImportCategory";
import type { LineageMember } from "#batiment/structure/types/LineageMember";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";

export interface BoundaryViolation {
  readonly cause: BoundaryCause;
  readonly boundary: LineageMember | undefined;
  readonly fix: string | undefined;
  readonly category?: ImportCategory;
  readonly unclassified?: Directory;
  readonly directories?: Directories;
}
