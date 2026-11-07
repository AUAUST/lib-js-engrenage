import type {
  EntityIndex,
  ResolvedSpecifier,
  ResolvedStructure,
} from "#project/structure/index";
import type { File } from "#types/File";

export interface ImportGraph {
  readonly structure: ResolvedStructure;
  readonly entities: EntityIndex;
  resolveImport(specifier: string, from: File): ResolvedSpecifier | undefined;
}
