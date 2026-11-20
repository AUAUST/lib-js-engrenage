import type { reexportModes } from "#batiment/roles/constants";

/**
 * How a generated root entry re-exports a role's barrel: `namespace` under its
 * directory's name, `flat` spreading its names among the root's.
 *
 * @experimental
 */
export type ReexportMode = (typeof reexportModes)[number];
