import { isBelow } from "#tools/typescript/utils/isBelow";
import type { StructureNode } from "#batiment/structure/index";
import type { Filesystem } from "#foundation/filesystem/index";
import type { ModuleMatcher } from "#tools/typescript/types/ModuleMatcher";
import type { Files } from "#types/Files";

export async function listRoleModules(
  filesystem: Filesystem,
  node: StructureNode,
  isModule: ModuleMatcher,
): Promise<Files> {
  const files = await filesystem.list(node.path);

  return files.filter((file) => {
    return (
      isModule(file) &&
      !node.children.some((child) => isBelow(child.path, file))
    );
  });
}
