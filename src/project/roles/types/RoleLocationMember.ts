import type { Directory } from "#types/Directory";

export interface RoleLocationMember {
  readonly name: string;
  readonly path: Directory;
  readonly kind: "namespace" | "domain";
}
