import type { ResolvedRoles } from "#batiment/roles/index";
import type { Entity } from "#batiment/structure/types/Entity";
import type { NamedFileRole } from "#batiment/structure/types/NamedFileRole";

export interface LocatedEntity {
  readonly entity: Entity;
  readonly roles: ResolvedRoles | undefined;
  readonly named: readonly NamedFileRole[];
  readonly covers: boolean;
}
