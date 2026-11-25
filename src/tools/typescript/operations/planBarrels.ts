import { posix } from "node:path";

import { filterMap } from "@auaust/toolkit/array";
import { values } from "@auaust/toolkit/object";

import {
  collectStructureNodes,
  getRootEntryFile,
  type NamespaceStructure,
  type ResolvedStructure,
} from "#batiment/structure/index";
import { createModuleMatcher } from "#tools/typescript/operations/createModuleMatcher";
import { isGeneratedBarrel } from "#tools/typescript/operations/isGeneratedBarrel";
import { listCollectedModules } from "#tools/typescript/operations/listCollectedModules";
import { listDomainModules } from "#tools/typescript/operations/listDomainModules";
import { planIndexBarrels } from "#tools/typescript/operations/planIndexBarrels";
import { isCollected } from "#tools/typescript/utils/isCollected";
import { listRootReexports } from "#tools/typescript/utils/listRootReexports";
import type { Filesystem } from "#foundation/filesystem/index";
import type { ConfigResolver } from "#project/config/index";
import type { BarrelPlan } from "#tools/typescript/types/BarrelPlan";
import type { ModuleMatcher } from "#tools/typescript/types/ModuleMatcher";
import type { File } from "#types/File";

async function isHandWritten(
  filesystem: Filesystem,
  file: File,
): Promise<boolean> {
  return (
    (await filesystem.exists(file)) &&
    !(await isGeneratedBarrel(filesystem, file))
  );
}

async function planRootEntry(
  filesystem: Filesystem,
  environment: NamespaceStructure,
  entryFile: File,
  roleBarrels: readonly BarrelPlan[],
): Promise<BarrelPlan[]> {
  const file = getRootEntryFile(environment);

  if (file === undefined || (await isHandWritten(filesystem, file))) {
    return [];
  }

  const reexports = listRootReexports(environment, entryFile, roleBarrels);

  return reexports.length === 0
    ? []
    : [
        {
          file,
          node: environment.root,
          modules: [],
          reexports,
        },
      ];
}

async function planEnvironment(
  filesystem: Filesystem,
  environment: NamespaceStructure,
  isModule: ModuleMatcher,
): Promise<BarrelPlan[]> {
  const { root, indexFile, entryFile } = environment;

  const barrels = await planIndexBarrels(filesystem, environment, isModule);

  if (entryFile === undefined) {
    return barrels;
  }

  const entryOnly = await Promise.all(
    collectStructureNodes(root).map(async (node) => {
      const hasGeneratedEntry = (
        node.kind === "domain" &&
        node.public === true &&
        !(await filesystem.exists(posix.join(node.path, indexFile))) &&
        !(await isHandWritten(filesystem, posix.join(node.path, entryFile)))
      );

      return hasGeneratedEntry ? [node] : [];
    }),
  );

  const domainEntries = await Promise.all(
    entryOnly.flat().map(async (domain): Promise<BarrelPlan> => {
      const own = await listDomainModules(
        filesystem,
        domain,
        environment,
        (_, contract) => isCollected(contract),
        isModule,
      );

      const collected = await listCollectedModules(
        filesystem,
        environment,
        domain.collects ?? [],
        isModule,
      );

      const listed = new Set(own.map(({ file }) => file));

      return {
        file: posix.join(domain.path, entryFile),
        node: domain,
        modules: [...own, ...collected.filter(({ file }) => !listed.has(file))],
        reexports: [],
      };
    }),
  );

  return [
    ...barrels,
    ...domainEntries,
    ...(await planRootEntry(filesystem, environment, entryFile, barrels)),
  ];
}

/**
 * The barrels of the scope `config` resolves, `structure` its walk.
 */
export async function planBarrels(
  config: ConfigResolver,
  structure: ResolvedStructure,
): Promise<readonly BarrelPlan[]> {
  const { filesystem } = config.context;

  const isModule = await createModuleMatcher(config);

  const plans = await Promise.all(
    filterMap(values(structure), (environment) => {
      if (environment !== undefined) {
        return planEnvironment(filesystem, environment, isModule);
      }
    }),
  );

  return plans.flat();
}
