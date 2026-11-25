import { basename, dirname } from "node:path";

import { getOwn, keys, values } from "@auaust/toolkit/object";

import {
  collectStructureNodes,
  getRootDirectory,
  getRootEntryFile,
  listNamespaceDirectories,
  type NamespaceStructure,
  type StructureNode,
} from "#batiment/structure/index";
import { domainsBlock } from "#tools/typescript/constants";
import { createModuleMatcher } from "#tools/typescript/operations/createModuleMatcher";
import { listCollectedModules } from "#tools/typescript/operations/listCollectedModules";
import { listDomainModules } from "#tools/typescript/operations/listDomainModules";
import { planIndexBarrels } from "#tools/typescript/operations/planIndexBarrels";
import { isBelow } from "#tools/typescript/utils/isBelow";
import { listRootReexports } from "#tools/typescript/utils/listRootReexports";
import type { ResolvedRoleContract } from "#batiment/roles/index";
import type { Filesystem } from "#foundation/filesystem/index";
import type { ConfigResolver } from "#project/config/index";
import type { BarrelModule } from "#tools/typescript/types/BarrelModule";
import type { BarrelPlan } from "#tools/typescript/types/BarrelPlan";
import type { ModuleMatcher } from "#tools/typescript/types/ModuleMatcher";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

async function planDomainsBlock(
  filesystem: Filesystem,
  environment: NamespaceStructure,
  file: File,
  isModule: ModuleMatcher,
): Promise<BarrelPlan> {
  const { entryFile } = environment;
  const rootEntry = getRootEntryFile(environment);
  const owner = getRootDirectory(environment)?.node;

  if (
    entryFile === undefined ||
    rootEntry === undefined ||
    owner === undefined
  ) {
    throw new Error(
      `The barrel marker "${domainsBlock}" of ${file} fills only an environment root entry, which its environment lacks`,
    );
  }

  if (file !== rootEntry) {
    throw new Error(
      `The barrel marker "${domainsBlock}" of ${file} fills only the environment root entry, ${rootEntry}`,
    );
  }

  const roleBarrels = await planIndexBarrels(filesystem, environment, isModule);

  return {
    file,
    node: owner,
    modules: [],
    reexports: listRootReexports(environment, entryFile, roleBarrels),
  };
}

// @debt a block naming a collected role lists it across the environment, while the generated entry of an entry-only domain lists it in that domain only, so `collected` scopes differently in blocks and in whole files
async function listBlockModules(
  filesystem: Filesystem,
  environment: NamespaceStructure,
  { owner, directory }: { owner: StructureNode; directory: Directory },
  role: string,
  contract: ResolvedRoleContract,
  isModule: ModuleMatcher,
): Promise<BarrelModule[]> {
  if (!contract.collected) {
    const modules = await listDomainModules(
      filesystem,
      owner,
      environment,
      (name) => name === role,
      isModule,
    );

    return modules.filter((module) => isBelow(directory, module.file));
  }

  return listCollectedModules(filesystem, environment, [role], isModule);
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

  const isModule = await createModuleMatcher(config);

  if (role === domainsBlock) {
    return planDomainsBlock(filesystem, environment, file, isModule);
  }

  const contract = getOwn(environment.roles, role)?.contract;

  if (contract === undefined) {
    throw new Error(
      `Unknown role "${role}" in the barrel marker of ${file}, expected one of: ${keys(environment.roles).join(", ")}`,
    );
  }

  if (
    basename(file) === environment.indexFile &&
    contract.surface === "modules"
  ) {
    throw new Error(
      `The role "${role}" has surface "modules": other domains import its modules directly, so ${file} lists none; remove its "@barrel ${role}" marker`,
    );
  }

  const directory = dirname(file);

  const owner = (
    listNamespaceDirectories(environment).find((top) => {
      return top.directory === directory;
    })?.node ??
    collectStructureNodes(environment.root).find((node) => {
      return node.path === directory;
    })
  );

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
      isModule,
    ),
    reexports: [],
  };
}
