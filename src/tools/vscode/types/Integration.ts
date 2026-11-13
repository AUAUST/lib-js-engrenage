import type { Settings } from "#tools/vscode/types/Settings";
import type { PackageNames } from "#types/PackageNames";

/**
 * Editor settings and recommended extensions of a tool, applied when every
 * package of `requires` is a dependency.
 */
export interface Integration {
  requires: PackageNames;
  settings: Settings;
  extensions: readonly string[];
}
