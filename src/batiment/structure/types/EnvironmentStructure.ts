import type { StructureDiagnostic } from "#batiment/report/index";
import type { Layout } from "#batiment/structure/ports/Layout";
import type { EnvironmentFileNames } from "#batiment/structure/types/EnvironmentFileNames";
import type { StructureNode } from "#batiment/structure/types/StructureNode";
import type { StructureRole } from "#batiment/structure/types/StructureRole";
import type { Directories } from "#types/Directories";
import type { File } from "#types/File";

/**
 * The classified directory tree of one environment, rooted at a namespace
 * gathering every directory of `dirs`. Under `strict`, an unclassified directory
 * is a violation; under `loose`, it counts as a domain, or a mirror in `tests`.
 * `roles` holds every role the walk met, by name. `unreached` lists, by path, each
 * namespace or domain the config (`config`) or metadata `files` declare where
 * the walk builds no node, a violation under either strictness. `entries` maps
 * each package subpath its domains and roles expose to its file. `diagnostics`
 * lists the walk's findings. `layout` is the layout shaping the tree, absent for
 * the namespace and domain walk.
 *
 * @experimental
 */
export interface EnvironmentStructure extends EnvironmentFileNames {
  readonly name: string;
  readonly dirs: Directories;
  readonly strictness: "strict" | "loose";
  readonly layout?: Layout;
  readonly root: StructureNode;
  readonly unclassified: readonly StructureNode[];
  readonly roles: Readonly<Record<string, StructureRole>>;
  readonly unreached: readonly {
    readonly path: string;
    readonly kind: "namespace" | "domain";
    readonly config: boolean;
    readonly files: readonly File[];
  }[];
  readonly entries: Readonly<Record<string, File>>;
  readonly diagnostics: readonly StructureDiagnostic[];
}
