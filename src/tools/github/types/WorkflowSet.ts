import type { Trait } from "#project/presets/types/Trait";
import type { Files } from "#types/Files";
import type { PackageNames } from "#types/PackageNames";

export interface WorkflowSet {
  trait: Trait;
  files: Files;
  requires: PackageNames;
  scripts: readonly string[];
}
