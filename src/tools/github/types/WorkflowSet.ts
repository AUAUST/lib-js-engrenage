import type { Files } from "#types/Files";
import type { PackageNames } from "#types/PackageNames";

export interface WorkflowSet {
  files: Files;
  requires: PackageNames;
  scripts: readonly string[];
}
