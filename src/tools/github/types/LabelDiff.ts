import type { LabelUpdate } from "#tools/github/types/LabelUpdate";
import type { NamedLabel } from "#tools/github/types/NamedLabel";

export interface LabelDiff {
  readonly create: readonly NamedLabel[];
  readonly update: readonly LabelUpdate[];
  readonly extra: readonly string[];
}
