import { basename, dirname } from "node:path";

import { getOwn, keys, values } from "@auaust/toolkit/object";

import {
  collectStructureNodes,
  type EnvironmentStructure,
  type ResolvedRoleContract,
  type StructureNode,
} from "#project/structure/index";
import { domainsBlock } from "#tools/typescript/constants";
import { listDomainModules } from "#tools/typescript/operations/listDomainModules";
import { planIndexBarrels } from "#tools/typescript/operations/planIndexBarrels";
import { isBelow } from "#tools/typescript/utils/isBelow";
import { isCollected } from "#tools/typescript/utils/isCollected";
import { listRootReexports } from "#tools/typescript/utils/listRootReexports";
import type { Filesystem } from "#foundation/filesystem/index";
import type { ConfigResolver } from "#project/config/index";
import type { BarrelModule } from "#tools/typescript/types/BarrelModule";
import type { BarrelPlan } from "#tools/typescript/types/BarrelPlan";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

async function planDomainsBlock(
  filesystem: Filesystem,
  environment: EnvironmentStructure,
  file: File,
): Promise<BarrelPlan> {
  const { dirs, entryFile, root } = environment;
  const directory = dirname(file);

  if (
    entryFile === undefined ||
    basename(file) !== entryFile ||
    !dirs.includes(directory)
  ) {
    throw new Error(
      `The barrel marker "${domainsBlock}" of ${file} fills only an environment root entry`,
    );
  }

  const roleBarrels = await planIndexBarrels(filesystem, environment);

  return {
    file,
    node: root,
    modules: [],
    reexports: listRootReexports(
      environment,
      directory,
      entryFile,
      roleBarrels,
    ),
  };
}

// @debt a block naming a collected role lists it across the environment, while the generated entry of an entry-only domain lists it in that domain only, so `collected` scopes differently in blocks and in whole files
async function listBlockModules(
  filesystem: Filesystem,
  environment: EnvironmentStructure,
  { owner, directory }: { owner: StructureNode; directory: Directory },
  role: string,
  contract: ResolvedRoleContract,
): Promise<BarrelModule[]> {
  if (!contract.collected) {
    const modules = await listDomainModules(
      filesystem,
      owner,
      environment,
      (name) => name === role,
    );

    return modules.filter((module) => isBelow(directory, module.file));
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
        (name, candidate) => {
          return name === role && isCollected(candidate);
        },
      );
    }),
  );

  return modules.flat();
}

export async function planBarrelBlock(
  config: ConfigResolver,
  file: File,
  role: string,
): Promise<BarrelPlan> {
  const { filesystem } = config.context;

  const structure = await config.resolve("structure");

  const environment = values(structure).find((candidate) => {
    return candidate?.dirs.some((directory) => isBelow(directory, file));
  });

  if (environment === undefined) {
    throw new Error(`${file} lies in no environment of the structure`);
  }

  if (role === domainsBlock) {
    return planDomainsBlock(filesystem, environment, file);
  }

  const contract = getOwn(environment.roles, role)?.contract;

  if (contract === undefined) {
    throw new Error(
      `Unknown role "${role}" in the barrel marker of ${file}, expected one of: ${keys(environment.roles).join(", ")}`,
    );
  }

  const directory = dirname(file);

  const owner = environment.dirs.includes(directory)
    ? environment.root
    : collectStructureNodes(environment.root).find((node) => {
        return node.path === directory;
      });

  if (owner === undefined) {
    throw new Error(`${file} sits in no domain of the structure`);
  }

  return {
    file,
    node: owner,
    modules: await listBlockModules(
      filesystem,
      environment,
      { owner, directory },
      role,
      contract,
    ),
    reexports: [],
  };
}
