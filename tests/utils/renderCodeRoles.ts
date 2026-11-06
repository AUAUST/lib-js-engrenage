import {
  adapters,
  constants,
  declarations,
  enums,
  errors,
  index,
  ports,
  types,
  utils,
  type Role,
} from "@auaust/engrenage/roles";

export function renderCodeRoles(...extra: readonly Role[]): string {
  return JSON.stringify([
    index(),
    constants(),
    declarations(),
    types(),
    utils(),
    errors(),
    enums(),
    ports(),
    adapters(),
    ...extra,
  ]);
}
