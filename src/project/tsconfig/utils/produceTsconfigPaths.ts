import { map } from "@auaust/primitive-kit/arrays";
import { entries, record } from "@auaust/toolkit/object";

import { resolveExportPaths } from "#project/package/index";
import { isPackageAlias } from "#project/tsconfig/utils/isPackageAlias";
import { readTsconfigPaths } from "#project/tsconfig/utils/readTsconfigPaths";
import { toTsconfigSpecifier } from "#project/tsconfig/utils/toTsconfigSpecifier";
import type { JsonEdit } from "#foundation/json/index";
import type { ProjectConfig } from "#project/config/index";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";

const pathsLocation = ["compilerOptions", "paths"];

export function produceTsconfigPaths(
  config: ProjectConfig,
  { key, file }: TsconfigTarget,
): readonly JsonEdit[] {
  if (key === "tests.dist") {
    return [
      {
        path: pathsLocation,
        value: {},
      },
    ];
  }

  const { src, packageJson } = config;

  if (key !== "base" || src.exports === undefined) {
    return [];
  }

  const { name } = packageJson;

  const generated = entries(resolveExportPaths(name, src.exports)).map(
    ([alias, targets]) => {
      return [
        alias,
        map(targets, (target) => toTsconfigSpecifier(file, target)),
      ];
    },
  );

  const others = entries(readTsconfigPaths(config, file)).filter(
    ([alias]) => !isPackageAlias(name, alias),
  );

  return [{ path: pathsLocation, value: record([...others, ...generated]) }];
}
