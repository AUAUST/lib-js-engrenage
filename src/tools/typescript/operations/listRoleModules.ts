import { isBelow } from "#tools/typescript/utils/isBelow";
import { isModule } from "#tools/typescript/utils/isModule";
import type { Filesystem } from "#foundation/filesystem/index";
import type { StructureNode } from "#project/structure/index";
import type { Files } from "#types/Files";

export async function listRoleModules(
  filesystem: Filesystem,
  node: StructureNode,
): Promise<Files> {
  const files = await filesystem.list(node.path);

  return files.filter((file) => {
    return (
      isModule(file) &&
      !node.children.some((child) => isBelow(child.path, file))
    );
  });
}
