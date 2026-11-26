import type { Rule } from "eslint";

import type { Entity, ImportEdge } from "#batiment/structure/index";
import type { File } from "#types/File";

export interface ModuleResolver {
  /**
   * Describes where the module at `file`, absolute or relative to the project
   * root, sits in the structure: its role, domain and lineage; `undefined` when
   * it lies outside the structure.
   */
  entityOf(file: File): Entity | undefined;
  /**
   * Resolves `specifier`, imported by the linted file at `node`, as the structure
   * rules do: the module file it names, `undefined` for a package, that module's
   * entity, `undefined` outside the structure, and a `type` kind when `node` is
   * a type-only import or export.
   */
  importOf(node: Rule.Node, specifier: string): ImportEdge;
}
