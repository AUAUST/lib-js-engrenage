import type { Trait } from "#project/presets/index";
import type { Files } from "#types/Files";
import type { PackageNames } from "#types/PackageNames";

/**
 * A set of GitHub workflow files, the default when `trait` is active and
 * every package of `requires` is a dependency, needing each of `scripts` in
 * `package.json`.
 */
export interface WorkflowSet {
  trait: Trait;
  files: Files;
  requires: PackageNames;
  scripts: readonly string[];
}
