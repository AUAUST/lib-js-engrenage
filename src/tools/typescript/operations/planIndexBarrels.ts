import { basename, dirname } from "node:path";

import { deduplicate } from "@auaust/primitive-kit/arrays";
import { toCamelCase } from "@auaust/primitive-kit/strings";
import { getOwn } from "@auaust/toolkit/object";

import {
  collectStructureNodes,
  type EnvironmentStructure,
  type ResolvedRoleContract,
  type StructureNode,
} from "#project/structure/index";
import { listRoleModules } from "#tools/typescript/operations/listRoleModules";
import { collectRoleNodes } from "#tools/typescript/utils/collectRoleNodes";
import { isBelow } from "#tools/typescript/utils/isBelow";
import { locateDomain } from "#tools/typescript/utils/locateDomain";
import type { Filesystem } from "#foundation/filesystem/index";
import type { BarrelPlan } from "#tools/typescript/types/BarrelPlan";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Files } from "#types/Files";

function planRoleBarrels(
  node: StructureNode,
  contract: ResolvedRoleContract,
  files: Files,
  { indexFile, domain }: { indexFile: File; domain: Directory },
): BarrelPlan[] {
  const plans: BarrelPlan[] = [];

  function plan(directory: Directory): BarrelPlan | undefined {
    const nested = files.filter((file) => {
      return isBelow(directory, file) && dirname(file) !== directory;
    });

    const subdirectories = deduplicate(
      nested.map((file) => {
        return file.slice(directory.length + 1).split("/")[0] ?? file;
      }),
    );

    const reexports = subdirectories.flatMap((name) => {
      const barrel = plan(`${directory}/${name}`);

      return barrel === undefined
        ? []
        : { file: barrel.file, name: toCamelCase(name) };
    });

    const modules = files.filter((file) => {
      return dirname(file) === directory && basename(file) !== indexFile;
    });

    if (modules.length === 0 && reexports.length === 0) {
      return;
    }

    const barrel: BarrelPlan = {
      file: `${directory}/${indexFile}`,
      node,
      modules: modules.map((file) => {
        return {
          file,
          contract,
          domain,
        };
      }),
      reexports,
    };

    plans.push(barrel);

    return barrel;
  }

  plan(node.path);

  return plans;
}

export async function planIndexBarrels(
  filesystem: Filesystem,
  environment: EnvironmentStructure,
): Promise<BarrelPlan[]> {
  const { root, roles, indexFile } = environment;

  const owners = collectStructureNodes(root).filter((node) => {
    return node.kind !== "role";
  });

  const roleNodes = owners.flatMap((owner) => {
    const domain = locateDomain(environment, owner);

    return collectRoleNodes(owner).map((node) => {
      return { node, domain };
    });
  });

  const barrels = await Promise.all(
    roleNodes.map(async ({ node, domain }) => {
      const contract = node.role === undefined
        ? undefined
        : getOwn(roles, node.role)?.contract;

      if (contract?.index !== true) {
        return [];
      }

      const files = await listRoleModules(filesystem, node);

      return planRoleBarrels(node, contract, files, {
        indexFile,
        domain,
      });
    }),
  );

  return barrels.flat();
}
