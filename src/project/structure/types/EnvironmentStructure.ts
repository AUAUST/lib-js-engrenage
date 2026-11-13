import type { EnvironmentFileNames } from "#project/structure/types/EnvironmentFileNames";
import type { StructureNode } from "#project/structure/types/StructureNode";
import type { StructureRole } from "#project/structure/types/StructureRole";
import type { Directories } from "#types/Directories";

/**
 * The classified directory tree of one environment, rooted at a namespace
 * gathering every directory of `dirs`. Under `strict`, an unclassified directory
 * is a violation; under `loose`, it counts as a domain, or a mirror in `tests`.
 * `roles` holds every role the walk met, by name.
 *
 * @experimental
 */
export interface EnvironmentStructure extends EnvironmentFileNames {
  readonly name: string;
  readonly dirs: Directories;
  readonly strictness: "strict" | "loose";
  readonly root: StructureNode;
  readonly unclassified: readonly StructureNode[];
  readonly roles: Readonly<Record<string, StructureRole>>;
}
