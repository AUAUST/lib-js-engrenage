import type { PackageName } from "#types/PackageName";

export interface WorkspaceSettings {
  allowBuilds: Readonly<Record<PackageName, boolean>>;
  minimumReleaseAgeExclude: readonly string[];
}
