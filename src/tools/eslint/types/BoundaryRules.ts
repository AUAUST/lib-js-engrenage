import type { BoundaryOptions } from "#tools/eslint/types/BoundaryOptions";
import type { BoundaryRow } from "#tools/eslint/types/BoundaryRow";

export type BoundaryRules = Readonly<Record<BoundaryRow, BoundaryOptions>>;
