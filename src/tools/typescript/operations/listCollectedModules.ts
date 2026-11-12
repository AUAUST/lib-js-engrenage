import {
  collectStructureNodes,
  type EnvironmentStructure,
} from "#project/structure/index";
import { listDomainModules } from "#tools/typescript/operations/listDomainModules";
import { isCollected } from "#tools/typescript/utils/isCollected";
import type { Filesystem } from "#foundation/filesystem/index";
import type { BarrelModule } from "#tools/typescript/types/BarrelModule";

export async function listCollectedModules(
  filesystem: Filesystem,
  environment: EnvironmentStructure,
  roles: readonly string[],
): Promise<BarrelModule[]> {
  if (roles.length === 0) {
    return [];
  }

  const domains = collectStructureNodes(environment.root).filter((node) => {
    return node.kind === "domain";
  });

  const modules = await Promise.all(
    domains.map((domain) => {
      return listDomainModules(
        filesystem,
        domain,
        environment,
        (role, contract) => {
          return roles.includes(role) && isCollected(contract);
        },
      );
    }),
  );

  return modules.flat();
}
