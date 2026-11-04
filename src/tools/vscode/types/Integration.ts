import type { Settings } from "#tools/vscode/types/Settings";
import type { PackageNames } from "#types/PackageNames";

export interface Integration {
  requires: PackageNames;
  settings: Settings;
  extensions: readonly string[];
}
