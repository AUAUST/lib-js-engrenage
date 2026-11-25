import type { StructureDiagnostic } from "#batiment/report/index";
import type { NamespaceRoles, RoleRegistry } from "#batiment/roles/index";
import type { Layout } from "#batiment/structure/ports/Layout";
import type { NamespaceStructureOption } from "#batiment/structure/ports/NamespaceStructureOption";
import type { DeclaredStructure } from "#batiment/structure/types/DeclaredStructure";
import type { StructureMetadata } from "#batiment/structure/types/StructureMetadata";
import type { ValueOrigin } from "#foundation/options/index";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";

// @debt `declared` and `read` are undefined together for a disabled or inactive environment, checked at runtime; a union discriminated by state would type it
export interface DeclaredNamespace {
  readonly name: string;
  readonly key: string;
  readonly dirs: Directories;
  readonly active: boolean;
  readonly option: NamespaceStructureOption;
  readonly layout: Layout | undefined;
  readonly roles: NamespaceRoles | undefined;
  readonly directoryRoles: ReadonlyMap<Directory, NamespaceRoles>;
  readonly declared:
    | (DeclaredStructure & {
        readonly defined: RoleRegistry;
        readonly optionPaths: Readonly<Record<Directory, string>>;
      })
    | undefined;
  readonly read:
    | {
        readonly metadata: readonly StructureMetadata[];
        readonly diagnostics: readonly StructureDiagnostic[];
      }
    | undefined;
  readonly origins: ReadonlyMap<string, ValueOrigin>;
}
