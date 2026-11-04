import type { EnvironmentStructure } from "#structure/types/EnvironmentStructure";
import type { StructureEnvironment } from "#structure/types/StructureEnvironment";
import type { TestsLayout } from "#structure/types/TestsLayout";
import type { Directories } from "#types/Directories";

export interface TestsContext {
  readonly layout: TestsLayout;
  readonly environments: Readonly<
    Partial<
      Record<
        StructureEnvironment,
        {
          readonly dirs: Directories;
          readonly structure: EnvironmentStructure | undefined;
        }
      >
    >
  >;
}
