import type { ResolvedRoles } from "#batiment/roles/index";
import type { Entity } from "#project/structure/types/Entity";
import type { NamedFileRole } from "#project/structure/types/NamedFileRole";

export interface LocatedEntity {
  readonly entity: Entity;
  readonly roles: ResolvedRoles | undefined;
  readonly named: readonly NamedFileRole[];
  readonly covers: boolean;
}
