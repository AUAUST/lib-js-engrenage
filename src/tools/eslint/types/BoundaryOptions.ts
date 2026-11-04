import type { BoundaryPolicy } from "#tools/eslint/types/BoundaryPolicy";

export interface BoundaryOptions {
  default: "allow";
  policies: BoundaryPolicy[];
  checkUnknownLocals: boolean;
  checkAllOrigins: boolean;
}
