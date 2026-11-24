import { posix } from "node:path";

import { entries, record } from "@auaust/toolkit/object";

import { rootScope } from "#batiment/scopes/constants";
import { packageJsonFile } from "#constants";
import { declareSection } from "#foundation/options/index";
import { createPackageJson } from "#project/package/index";
import { createImportResolver } from "#project/structure/utils/createImportResolver";
import type { ConfigResolver } from "#project/config/index";
import type { ScopeImports } from "#project/structure/types/ScopeImports";
import type { PackageName } from "#types/PackageName";

// @debt reads a workspace's package.json outside the live packageJson key, so a renamed workspace package keeps its old name in a long-lived resolver
async function readWorkspacePackageName(
  config: ConfigResolver,
  dir: string,
): Promise<PackageName | undefined> {
  const path = posix.join(dir, packageJsonFile);

  return createPackageJson({
    root: config.context.root,
    path,
    content: await config.context.filesystem.read(path),
  }).optional.name;
}

export const importResolverSection = declareSection({
  async resolve(
    _input,
    config: ConfigResolver,
  ): Promise<ReturnType<typeof createImportResolver>> {
    const [scopes, packageJson] = await Promise.all([
      config.resolve("aliases.scopes"),
      config.resolve("packageJson"),
    ]);

    const imports = await Promise.all(
      entries(scopes).map(async ([dir, aliases]) => {
        const packageName = dir === rootScope
          ? packageJson.optional.name
          : await readWorkspacePackageName(config, dir);

        return [dir, { aliases, packageName } satisfies ScopeImports] as const;
      }),
    );

    return createImportResolver({
      root: config.context.root,
      scopes: record(imports),
    });
  },
});
