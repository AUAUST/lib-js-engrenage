import { map } from "@auaust/primitive-kit/arrays";
import { entries, record } from "@auaust/toolkit/object";

import { isPackageAlias } from "#typescript/utils/isPackageAlias";
import { readTsconfigPaths } from "#typescript/utils/readTsconfigPaths";
import { resolveExportPaths } from "#typescript/utils/resolveExportPaths";
import { toTsconfigSpecifier } from "#typescript/utils/toTsconfigSpecifier";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonEdit } from "#support/json/types/JsonEdit";
import type { TsconfigTarget } from "#typescript/types/TsconfigTarget";

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
