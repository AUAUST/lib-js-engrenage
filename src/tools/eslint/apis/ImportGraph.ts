import type {
  EntityIndex,
  ResolvedSpecifier,
  ResolvedStructure,
} from "#project/structure/index";
import type { File } from "#types/File";

export interface ImportGraph {
  /**
   * The project structure the graph checks imports against.
   */
  readonly structure: ResolvedStructure;
  /**
   * Finds the entity, environment, domain and role, of an importing or imported
   * file.
   */
  readonly entities: EntityIndex;
  /**
   * Classifies `specifier` as imported from `from`: a relative path joined to
   * the importer's directory, an expanded `#` alias, a self-reference to the
   * package or another package. Returns `undefined` for a `#` specifier matching
   * no alias.
   */
  resolveImport(specifier: string, from: File): ResolvedSpecifier | undefined;
}
