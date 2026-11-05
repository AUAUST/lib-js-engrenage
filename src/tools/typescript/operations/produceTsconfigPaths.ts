import { map } from "@auaust/primitive-kit/arrays";
import { entries, record } from "@auaust/toolkit/object";

import {
  packageJsonSection,
  sourceExportsSection,
  type LoadedConfig,
} from "#project/config/index";
import { resolveExportPaths } from "#project/package/index";
import {
  isPackageAlias,
  readTsconfigPaths,
  toTsconfigSpecifier,
  type TsconfigTarget,
} from "#project/tsconfig/index";
import type { JsonEdit } from "#foundation/json/index";

const pathsLocation = ["compilerOptions", "paths"];

export async function produceTsconfigPaths(
  config: LoadedConfig,
  { key, file }: TsconfigTarget,
): Promise<readonly JsonEdit[]> {
  if (key === "tests.dist") {
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

  const exposed = await config.resolve(sourceExportsSection);

  if (exposed === undefined) {
    return [];
  }

  const { name } = await config.resolve(packageJsonSection);

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
