import type { EnvironmentStructure } from "#structure/types/EnvironmentStructure";
import type { StructureEnvironmentName } from "#structure/types/StructureEnvironmentName";
import type { TestsLayout } from "#structure/types/TestsLayout";
import type { Directories } from "#types/Directories";

export interface TestsContext {
  readonly layout: TestsLayout;
  readonly environments: Readonly<
    Partial<
      Record<
        StructureEnvironmentName,
        {
          readonly dirs: Directories;
          readonly structure: EnvironmentStructure | undefined;
        }
      >
    >
  >;
}
