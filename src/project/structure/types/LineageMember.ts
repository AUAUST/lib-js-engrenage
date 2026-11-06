import type { Directory } from "#types/Directory";

export interface LineageMember {
  readonly path: Directory;
  readonly kind: "namespace" | "domain";
  readonly layer: number | undefined;
  readonly layers: readonly string[] | undefined;
  readonly isolated: boolean;
}
