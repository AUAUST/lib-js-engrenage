import { posix } from "node:path";

import { values } from "@auaust/toolkit/object";

import {
  collectStructureNodes,
  type EnvironmentStructure,
} from "#project/structure/index";
import { barrelHeader } from "#tools/typescript/constants";
import { listDomainModules } from "#tools/typescript/operations/listDomainModules";
import { planIndexBarrels } from "#tools/typescript/operations/planIndexBarrels";
import { isCollected } from "#tools/typescript/utils/isCollected";
import { listRootReexports } from "#tools/typescript/utils/listRootReexports";
import type { Filesystem } from "#foundation/filesystem/index";
import type { ConfigResolver } from "#project/config/index";
import type { BarrelPlan } from "#tools/typescript/types/BarrelPlan";
import type { File } from "#types/File";

async function planRootEntries(
  filesystem: Filesystem,
  environment: EnvironmentStructure,
  entryFile: File,
  roleBarrels: readonly BarrelPlan[],
): Promise<BarrelPlan[]> {
  const plans: BarrelPlan[] = [];

  for (const directory of environment.dirs) {
    const file = posix.join(directory, entryFile);

    const content = await filesystem.read(file);

    if (content !== undefined && !content.startsWith(barrelHeader)) {
      continue;
    }

    const reexports = listRootReexports(
      environment,
      directory,
      entryFile,
      roleBarrels,
    );

    if (reexports.length > 0) {
      plans.push({
        file,
        node: environment.root,
        modules: [],
        reexports,
      });
    }
  }

  return plans;
}

async function planEnvironment(
  filesystem: Filesystem,
  environment: EnvironmentStructure,
): Promise<BarrelPlan[]> {
  const { root, indexFile, entryFile } = environment;

  const barrels = await planIndexBarrels(filesystem, environment);

  if (entryFile === undefined) {
    return barrels;
  }

  const entryOnly = await Promise.all(
    collectStructureNodes(root).map(async (node) => {
      const isEntryOnly = (
        node.kind === "domain" &&
        node.public === true &&
        !(await filesystem.exists(posix.join(node.path, indexFile)))
      );

      return isEntryOnly ? [node] : [];
    }),
  );

  const domainEntries = await Promise.all(
    entryOnly.flat().map(async (domain): Promise<BarrelPlan> => {
      return {
        file: posix.join(domain.path, entryFile),
        node: domain,
        modules: await listDomainModules(
          filesystem,
          domain,
          environment,
          (_, contract) => isCollected(contract),
        ),
        reexports: [],
      };
    }),
  );

  return [
    ...barrels,
    ...domainEntries,
    ...(await planRootEntries(filesystem, environment, entryFile, barrels)),
  ];
}

export async function planBarrels(
  config: ConfigResolver,
): Promise<readonly BarrelPlan[]> {
  const structure = await config.resolve("structure");

  const plans = await Promise.all(
    values(structure).map((environment) => {
      return environment === undefined
        ? []
        : planEnvironment(config.context.filesystem, environment);
    }),
  );

  return plans.flat();
}
