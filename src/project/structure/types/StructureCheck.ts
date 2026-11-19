export interface StructureCheck {
  readonly lines: readonly string[];
  readonly violations: readonly string[];
  readonly warnings: readonly string[];
  readonly violated: boolean;
}
