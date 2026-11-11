import { basename, dirname, posix } from "node:path";

import { deduplicate } from "@auaust/primitive-kit/arrays";
import { toCamelCase } from "@auaust/primitive-kit/strings";
import { entries, getOwn, values } from "@auaust/toolkit/object";

import {
  collectStructureNodes,
  resolveDomainEntries,
  type EnvironmentStructure,
  type ResolvedRoleContract,
  type StructureNode,
} from "#project/structure/index";
import {
  barrelHeader,
  declarationExtension,
  typescriptExtensions,
} from "#tools/typescript/constants";
import type { Filesystem } from "#foundation/filesystem/index";
import type { ConfigResolver } from "#project/config/index";
import type { ReexportMode } from "#project/roles/index";
import type { BarrelExport } from "#tools/typescript/types/BarrelExport";
import type { BarrelModule } from "#tools/typescript/types/BarrelModule";
import type { BarrelPlan } from "#tools/typescript/types/BarrelPlan";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Files } from "#types/Files";

const subpathPrefix = "./";

function isModule(file: File): boolean {
  return (
    !file.endsWith(declarationExtension) &&
    typescriptExtensions.some((extension) => file.endsWith(extension))
  );
}

function isBelow(directory: Directory, path: string): boolean {
  return directory === "." || path.startsWith(`${directory}/`);
}

function isCollected(
  contract: ResolvedRoleContract | undefined,
): contract is ResolvedRoleContract {
  return (
    contract !== undefined &&
    contract.collected &&
    contract.public &&
    !contract.subpath
  );
}

function collectRoleNodes(node: StructureNode): StructureNode[] {
  return node.children
    .filter((child) => child.kind === "role")
    .flatMap((child) => {
      return [child, ...collectRoleNodes(child)];
    });
}

async function listRoleModules(
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

function planRoleBarrels(
  node: StructureNode,
  contract: ResolvedRoleContract,
  files: Files,
  indexFile: File,
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
        return { file, contract };
      }),
      reexports,
    };

    plans.push(barrel);

    return barrel;
  }

  plan(node.path);

  return plans;
}

async function listDomainModules(
  filesystem: Filesystem,
  domain: StructureNode,
  { roles, indexFile }: EnvironmentStructure,
): Promise<BarrelModule[]> {
  const fileModules = entries(domain.roleFiles ?? {}).flatMap(
    ([role, files]) => {
      const contract = getOwn(roles, role)?.contract;

      return isCollected(contract)
        ? files.filter(isModule).map((file) => {
            return { file, contract };
          })
        : [];
    },
  );

  const directoryModules = await Promise.all(
    collectRoleNodes(domain).map(async (node) => {
      const contract = node.role === undefined
        ? undefined
        : getOwn(roles, node.role)?.contract;

      if (!isCollected(contract)) {
        return [];
      }

      const files = await listRoleModules(filesystem, node);

      return files
        .filter((file) => {
          return !contract.index || basename(file) !== indexFile;
        })
        .map((file) => {
          return { file, contract };
        });
    }),
  );

  return [...fileModules, ...directoryModules.flat()];
}

function toNamespace(subpath: string): string {
  return toCamelCase(subpath.slice(subpathPrefix.length).replaceAll("/", " "));
}

function reexportAs(
  file: File,
  modes: readonly ReexportMode[],
  namespace: string,
  typeOnly: boolean,
): BarrelExport[] {
  return modes.map((mode) => {
    return {
      file,
      ...(mode === "namespace" ? { name: namespace } : {}),
      ...(typeOnly ? { typeOnly } : {}),
    };
  });
}

async function planRootEntries(
  filesystem: Filesystem,
  environment: EnvironmentStructure,
  entryFile: File,
  roleBarrels: readonly BarrelPlan[],
): Promise<BarrelPlan[]> {
  const { root, roles, indexFile } = environment;

  const subpaths = new Map(
    entries(resolveDomainEntries(environment)).map(([subpath, file]) => {
      return [file, subpath] as const;
    }),
  );

  const domains = collectStructureNodes(root).filter((node) => {
    return node.kind === "domain" && node.public === true;
  });

  const barrels = new Set(roleBarrels.map(({ file }) => file));

  const globalRoles = root.children.flatMap((node) => {
    const contract = node.kind === "role" && node.role !== undefined
      ? getOwn(roles, node.role)?.contract
      : undefined;

    const barrel = posix.join(node.path, indexFile);

    return contract?.reexport === undefined || !barrels.has(barrel)
      ? []
      : {
          node,
          barrel,
          contract,
          reexport: contract.reexport,
        };
  });

  const plans: BarrelPlan[] = [];

  for (const directory of environment.dirs) {
    const file = posix.join(directory, entryFile);

    const content = await filesystem.read(file);

    if (content !== undefined && !content.startsWith(barrelHeader)) {
      continue;
    }

    const domainExports = domains
      .filter((domain) => isBelow(directory, domain.path))
      .flatMap((domain) => {
        const entry = posix.join(domain.path, entryFile);
        const subpath = subpaths.get(entry);

        if (subpath === undefined) {
          throw new Error(`${entry} has no package subpath`);
        }

        return reexportAs(
          entry,
          domain.reexport ?? [],
          toNamespace(subpath),
          false,
        );
      });

    const roleExports = globalRoles
      .filter(({ node }) => isBelow(directory, node.path))
      .flatMap(({ node, barrel, contract, reexport }) => {
        return reexportAs(
          barrel,
          reexport,
          toCamelCase(node.name),
          contract.typeOnly,
        );
      });

    const reexports = [...domainExports, ...roleExports];

    if (reexports.length > 0) {
      plans.push({
        file,
        node: root,
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
  const { root, roles, indexFile, entryFile } = environment;

  const nodes = collectStructureNodes(root);

  const roleBarrels = await Promise.all(
    nodes.map(async (node) => {
      const contract = node.kind === "role" && node.role !== undefined
        ? getOwn(roles, node.role)?.contract
        : undefined;

      if (contract?.index !== true) {
        return [];
      }

      const files = await listRoleModules(filesystem, node);

      return planRoleBarrels(node, contract, files, indexFile);
    }),
  );

  const barrels = roleBarrels.flat();

  if (entryFile === undefined) {
    return barrels;
  }

  const entryOnly = await Promise.all(
    nodes.map(async (node) => {
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
        modules: await listDomainModules(filesystem, domain, environment),
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
