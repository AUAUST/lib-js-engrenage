import type { Directory } from "#types/Directory";

/**
 * A namespace or domain enclosing a role location, with its directory.
 *
 * @experimental
 */
export interface RoleLocationMember {
  readonly name: string;
  readonly path: Directory;
  readonly kind: "namespace" | "domain";
}
