import type {
  roleTypeExportStyles,
  roleValueExportStyles,
} from "#project/roles/constants";

/**
 * @experimental
 */
export interface ResolvedRoleExports {
  readonly values: (typeof roleValueExportStyles)[number] | undefined;
  readonly types: (typeof roleTypeExportStyles)[number] | undefined;
}
