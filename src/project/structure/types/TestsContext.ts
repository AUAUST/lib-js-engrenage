import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { StructureEnvironment } from "#project/structure/types/StructureEnvironment";
import type { TestsLayout } from "#project/structure/types/TestsLayout";
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
