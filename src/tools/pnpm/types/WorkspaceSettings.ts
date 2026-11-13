import type { PackageName } from "#types/PackageName";

/**
 * Settings sync adds to `pnpm-workspace.yaml` when missing, keeping the values
 * the project already sets.
 */
export interface WorkspaceSettings {
  allowBuilds: Readonly<Record<PackageName, boolean>>;
  minimumReleaseAgeExclude: readonly string[];
}
