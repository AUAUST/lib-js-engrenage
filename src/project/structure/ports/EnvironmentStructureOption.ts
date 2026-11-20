import type {
  NamespaceDeclaration,
  ProgramLayout,
} from "#batiment/environments/index";
import type { Role } from "#batiment/roles/index";
import type { Directory } from "#types/Directory";

export type EnvironmentStructureOption =
  | { readonly enabled: false }
  | {
      readonly enabled: true;
      readonly roles?: readonly Role[];
      readonly omitRoles?: readonly string[];
      readonly tree?: ProgramLayout;
      readonly mirror?: boolean;
      readonly structure: NamespaceDeclaration;
      readonly optOut: readonly Directory[];
      readonly strictness: "strict" | "loose";
    };
