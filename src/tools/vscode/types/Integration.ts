import type { PackageNames } from "#types/PackageNames";
import type { Settings } from "#vscode/types/Settings";

export interface Integration {
  requires: PackageNames;
  settings: Settings;
  extensions: readonly string[];
}
