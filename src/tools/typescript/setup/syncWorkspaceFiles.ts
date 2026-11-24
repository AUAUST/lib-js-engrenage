import { posix } from "node:path";

import { getOwn } from "@auaust/toolkit/object";

import { rootScope } from "#batiment/scopes/constants";
import { packageJsonFile } from "#constants";
import { emptyObjectFile } from "#foundation/json/constants";
import { jsonIndentation } from "#project/format/constants";
import {
  createScopeFields,
  writePackageJsonValue,
  type PackageField,
} from "#project/package/index";
import { resolveScopeExports } from "#project/structure/index";
import { listScopeConfigs } from "#project/workspaces/index";
import { syncImports } from "#tools/typescript/operations/syncImports";
import { listSubpathImports } from "#tools/typescript/utils/listSubpathImports";
import type { LoadedConfig } from "#project/config/index";

async function createPackageFields(
  scoped: LoadedConfig,
): Promise<PackageField[]> {
  const [
    name,
    version,
    license,
    { node },
    { published },
    visibility,
  ] = await Promise.all([
    scoped.resolve("name"),
    scoped.resolve("version"),
    scoped.resolve("license"),
    scoped.resolve("runtime"),
    scoped.resolve("traits"),
    scoped.resolve("visibility"),
  ]);

  return [
    ...(name === undefined
      ? []
      : [{ location: ["name"], value: name } as const]),
    ...(version === undefined
      ? []
      : [{ location: ["version"], value: version } as const]),
    ...(license === undefined
      ? []
      : [{ location: ["license"], value: license } as const]),
    ...createScopeFields({
      node,
      published,
      visibility,
    }),
  ];
}

export async function syncWorkspaceFiles(config: LoadedConfig) {
  const [configs, scopes, scopeExports] = await Promise.all([
    listScopeConfigs(config),
    config.resolve("aliases.scopes"),
    resolveScopeExports(config),
  ]);

  const { filesystem, path } = config.context;

  for (const scoped of configs) {
    const { scopeDir } = scoped.context;

    if (scopeDir === rootScope) {
      continue;
    }

    const packageFile = posix.join(scopeDir, packageJsonFile);
    const packagePath = path(packageFile);

    const exports = scopeExports.get(scopeDir);

    const fields = [
      ...(await createPackageFields(scoped)),
      ...(exports === undefined
        ? []
        : [{ location: ["exports"], value: exports } as const]),
    ];

    await filesystem.write(
      packageFile,
      fields.reduce(
        (current, { location, value }) => {
          return writePackageJsonValue(
            current,
            packagePath,
            location,
            value,
            jsonIndentation,
          );
        },
        (await filesystem.read(packageFile)) ?? emptyObjectFile,
      ),
    );

    const aliases = getOwn(scopes, scopeDir);

    if (aliases === undefined) {
      throw new Error(`Workspace ${scopeDir} has no alias table`);
    }

    if (aliases.enabled) {
      await syncImports(
        config,
        packageFile,
        listSubpathImports([...aliases.global, ...aliases.src]),
      );
    }
  }
}
