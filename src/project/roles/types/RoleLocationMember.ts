import type { Directory } from "#types/Directory";

/** @experimental */
export interface RoleLocationMember {
  readonly name: string;
  readonly path: Directory;
  readonly kind: "namespace" | "domain";
}
