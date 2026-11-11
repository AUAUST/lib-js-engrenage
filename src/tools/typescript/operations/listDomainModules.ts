import { basename, matchesGlob, posix } from "node:path";

import { entries, getOwn } from "@auaust/toolkit/object";

import { listRoleModules } from "#tools/typescript/operations/listRoleModules";
import { collectRoleNodes } from "#tools/typescript/utils/collectRoleNodes";
import { isModule } from "#tools/typescript/utils/isModule";
import { locateDomain } from "#tools/typescript/utils/locateDomain";
import type { Filesystem } from "#foundation/filesystem/index";
import type {
  EnvironmentStructure,
  ResolvedRoleContract,
  StructureNode,
} from "#project/structure/index";
import type { BarrelModule } from "#tools/typescript/types/BarrelModule";
import type { File } from "#types/File";

// @debt re-derives the role of each file inside a role directory from `fileNames`, which the structure walker already classifies; the resolved structure could carry each role node's files with their roles
function nameRoleFiles(node: StructureNode) {
  const named = entries(node.fileNames ?? {});

  return (file: File): string | undefined => {
    const name = posix.relative(node.path, file);

    const nested = named.find(([, globs]) => {
      return globs.some((glob) => matchesGlob(name, glob));
    });

    return nested?.[0] ?? node.role;
  };
}

export async function listDomainModules(
  filesystem: Filesystem,
  domain: StructureNode,
  environment: EnvironmentStructure,
  accepts: (role: string, contract: ResolvedRoleContract) => boolean,
): Promise<BarrelModule[]> {
  const { roles, indexFile } = environment;
  const location = locateDomain(environment, domain);

  function toModule(file: File, role: string | undefined): BarrelModule[] {
    const contract = role === undefined
      ? undefined
      : getOwn(roles, role)?.contract;

    if (role === undefined || contract === undefined) {
      return [];
    }

    const isListed = (
      accepts(role, contract) &&
      isModule(file) &&
      !(contract.index && basename(file) === indexFile)
    );

    return isListed
      ? [
          {
            file,
            contract,
            domain: location,
          },
        ]
      : [];
  }

  const fileModules = entries(domain.roleFiles ?? {}).flatMap(
    ([role, files]) => {
      return files.flatMap((file) => toModule(file, role));
    },
  );

  const directoryModules = await Promise.all(
    collectRoleNodes(domain).map(async (node) => {
      const files = await listRoleModules(filesystem, node);

      const roleOf = nameRoleFiles(node);

      return files.flatMap((file) => toModule(file, roleOf(file)));
    }),
  );

  return [...fileModules, ...directoryModules.flat()];
}
