import type { Entity } from "#project/structure/types/Entity";
import type { File } from "#types/File";

export interface EntityIndex {
  entityOf(file: File): Entity | undefined;
  specifierOf(file: File): string | undefined;
  withinEnvironment(file: File): boolean;
}
