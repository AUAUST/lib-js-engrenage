import { map } from "@auaust/primitive-kit/arrays";
import { entries, record } from "@auaust/toolkit/object";

import { resolveExportPaths } from "#package/utils/resolveExportPaths";
import { readTsconfigPaths } from "#tsconfig/operations/readTsconfigPaths";
import { isPackageAlias } from "#tsconfig/utils/isPackageAlias";
import { toTsconfigSpecifier } from "#tsconfig/utils/toTsconfigSpecifier";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonEdit } from "#json/types/JsonEdit";
import type { TsconfigTarget } from "#tsconfig/types/TsconfigTarget";

const pathsLocation = ["compilerOptions", "paths"];

export function produceTsconfigPaths(
  config: ResolvedConfig,
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
