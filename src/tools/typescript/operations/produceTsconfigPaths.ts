import { map } from "@auaust/toolkit/array";
import { entries, record } from "@auaust/toolkit/object";

import { rootScope } from "#batiment/scopes/constants";
import { resolveExportPaths } from "#project/package/index";
import {
  isPackageAlias,
  readTsconfigPaths,
  toTsconfigSpecifier,
  type TsconfigTarget,
} from "#project/tsconfig/index";
import type { JsonEdit } from "#foundation/json/index";
import type { LoadedConfig } from "#project/config/index";

const pathsLocation = ["compilerOptions", "paths"];

export async function produceTsconfigPaths(
  config: LoadedConfig,
  { key, scope, file }: TsconfigTarget,
): Promise<readonly JsonEdit[]> {
  if (key === "tests.dist" || scope !== rootScope) {
    return [
      {
        path: pathsLocation,
        value: {},
      },
    ];
  }

  if (key !== "base") {
    return [];
  }

  const exposed = await config.resolve("src.exports");

  if (exposed === undefined) {
    return [];
  }

  const { name } = await config.resolve("packageJson");

  const generated = entries(resolveExportPaths(name, exposed)).map(
    ([alias, targets]) => {
      return [
        alias,
        map(targets, (target) => toTsconfigSpecifier(file, target)),
      ];
    },
  );

  const others = entries(await readTsconfigPaths(config, file)).filter(
    ([alias]) => !isPackageAlias(name, alias),
  );

  return [{ path: pathsLocation, value: record([...others, ...generated]) }];
}
