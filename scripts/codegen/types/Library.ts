import type { LibraryDeclaration } from "#scripts/codegen/types/LibraryDeclaration";

export interface Library {
  name: string;
  references: readonly string[];
  declarations: readonly LibraryDeclaration[];
  interfaces: ReadonlySet<string>;
  values: ReadonlySet<string>;
}
