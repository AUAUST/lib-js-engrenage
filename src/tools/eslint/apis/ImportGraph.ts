import type {
  EntityIndex,
  ResolvedSpecifier,
  ResolvedStructure,
} from "#batiment/structure/index";
import type { File } from "#types/File";

export interface ImportGraph {
  /**
   * The project structure the graph checks imports against.
   */
  readonly structure: ResolvedStructure;
  /**
   * Finds the entity, environment, domain and role, of an importing or
   * imported file.
   */
  readonly entities: EntityIndex;
  /**
   * Classifies `specifier` as imported from `from`: a relative path or an
   * expanded `#` alias, at the module file it names whatever its extension, or
   * at the path itself when no file exists; a self-reference to the package or
   * another package. Returns `undefined` for a `#` specifier matching no alias.
   */
  resolveImport(specifier: string, from: File): ResolvedSpecifier | undefined;
}
