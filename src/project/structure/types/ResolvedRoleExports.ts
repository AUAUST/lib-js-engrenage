import type {
  roleTypeExportStyles,
  roleValueExportStyles,
} from "#project/roles/constants";

/**
 * The export style a role's modules must follow for values and for types;
 * `undefined` leaves that kind of export unchecked.
 *
 * @experimental
 */
export interface ResolvedRoleExports {
  readonly values: (typeof roleValueExportStyles)[number] | undefined;
  readonly types: (typeof roleTypeExportStyles)[number] | undefined;
}
