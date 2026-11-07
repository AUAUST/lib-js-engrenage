import { listStaticFileGlobs } from "#project/structure/utils/listStaticFileGlobs";
import type { NamedFileRole } from "#project/structure/types/NamedFileRole";
import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";
import type { StructureNode } from "#project/structure/types/StructureNode";

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
