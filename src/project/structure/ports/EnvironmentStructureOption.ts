import type { Role } from "#project/roles/index";
import type { ProgramLayout } from "#project/structure/types/ProgramLayout";
import type { StructureOptions } from "#project/structure/types/StructureOptions";

export type EnvironmentStructureOption =
  | { readonly enabled: false }
  | ({
      readonly enabled: true;
      readonly roles?: readonly Role[];
      readonly tree?: ProgramLayout;
      readonly mirror?: boolean;
    } & StructureOptions<string | Role>);
