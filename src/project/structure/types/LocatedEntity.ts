import type { ResolvedRoles } from "#batiment/roles/index";
import type { NamedFileRole } from "#batiment/structure/index";
import type { Entity } from "#project/structure/types/Entity";

export interface LocatedEntity {
  readonly entity: Entity;
  readonly roles: ResolvedRoles | undefined;
  readonly named: readonly NamedFileRole[];
  readonly covers: boolean;
}
