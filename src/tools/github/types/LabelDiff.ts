import type { Label } from "#tools/github/types/Label";

export interface LabelDiff {
  readonly create: readonly (Label & { readonly name: string })[];
  readonly update: readonly (Label & {
    readonly name: string;
    readonly current: string;
  })[];
  readonly extra: readonly string[];
}
