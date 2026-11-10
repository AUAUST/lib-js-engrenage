import type { NamespaceDeclaration } from "#project/environments/index";
import type { Role } from "#project/roles/index";
import type { ProgramLayout } from "#project/structure/types/ProgramLayout";
import type { Directory } from "#types/Directory";

export type EnvironmentStructureOption =
  | { readonly enabled: false }
  | {
      readonly enabled: true;
      readonly roles?: readonly Role[];
      readonly tree?: ProgramLayout;
      readonly mirror?: boolean;
      readonly structure: NamespaceDeclaration;
      readonly optOut: readonly Directory[];
      readonly strictness: "strict" | "loose";
    };
