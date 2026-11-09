import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { Directories } from "#types/Directories";

export interface TestsContext {
  readonly mirror: boolean;
  readonly environments: Readonly<
    Partial<
      Record<
        string,
        {
          readonly dirs: Directories;
          readonly structure: EnvironmentStructure | undefined;
        }
      >
    >
  >;
}
