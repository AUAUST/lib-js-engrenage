import type { TestsLayout } from "#project/environments/index";
import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { StructureEnvironmentName } from "#project/structure/types/StructureEnvironmentName";
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
