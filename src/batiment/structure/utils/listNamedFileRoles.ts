import {
  listStaticFileGlobs,
  type ResolvedRoleContract,
} from "#batiment/roles/index";
import type { NamedFileRole } from "#batiment/structure/types/NamedFileRole";
import type { StructureNode } from "#batiment/structure/types/StructureNode";

export function listNamedFileRoles(
  names: readonly string[],
  contractOf: (name: string) => ResolvedRoleContract | undefined,
  fileNames: StructureNode["fileNames"],
): NamedFileRole[] {
  return names.flatMap((name): NamedFileRole[] => {
    const contract = contractOf(name);

    if (contract?.file === undefined) {
      return [];
    }

    const globs = fileNames?.[name] ?? listStaticFileGlobs(contract.file);

    return [
      {
        name,
        contract,
        globs,
      },
    ];
  });
}
