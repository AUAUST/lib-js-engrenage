import type { NamespaceStructure } from "#batiment/structure/types/NamespaceStructure";
import type { Directories } from "#types/Directories";

export interface TestsContext {
  readonly mirror: boolean;
  readonly namespaces: Readonly<
    Partial<
      Record<
        string,
        {
          readonly dirs: Directories;
          readonly structure: NamespaceStructure | undefined;
        }
      >
    >
  >;
}
