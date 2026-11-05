import { map } from "@auaust/primitive-kit/arrays";
import { entries, record } from "@auaust/toolkit/object";

import { resolveExportPaths } from "#project/package/index";
import { isPackageAlias } from "#project/tsconfig/utils/isPackageAlias";
import { readTsconfigPaths } from "#project/tsconfig/utils/readTsconfigPaths";
import { toTsconfigSpecifier } from "#project/tsconfig/utils/toTsconfigSpecifier";
import type { JsonEdit } from "#foundation/json/index";
import type { ConfigContext } from "#project/config/index";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";

const pathsLocation = ["compilerOptions", "paths"];

export async function produceTsconfigPaths(
  config: ConfigContext,
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

  const source = await config.get("src");

  const exposed = await source.exports;

  if (exposed === undefined) {
    return [];
  }

  const { name } = await config.get("packageJson");

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
