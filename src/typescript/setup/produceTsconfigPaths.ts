import { map } from "@auaust/primitive-kit/arrays";
import { entries, record } from "@auaust/toolkit/object";

import { readJsonValue } from "#support/json/utils/readJsonValue";
import { isPackageAlias } from "#typescript/utils/isPackageAlias";
import { resolveExportPaths } from "#typescript/utils/resolveExportPaths";
import { toTsconfigSpecifier } from "#typescript/utils/toTsconfigSpecifier";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonEdit } from "#support/json/types/JsonEdit";
import type { File } from "#types/File";
import type { Paths } from "#typescript/types/Paths";
import type { TsconfigTarget } from "#typescript/types/TsconfigTarget";

const pathsLocation = ["compilerOptions", "paths"];

function readHandWrittenPaths(config: ResolvedConfig, file: File): Paths {
  const current = config.filesystem.read(file);

  const paths =
    current === undefined
      ? undefined
      : readJsonValue(current, file, pathsLocation);

  return paths === undefined ? {} : (paths as Paths);
}

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

  const others = entries(readHandWrittenPaths(config, file)).filter(
    ([alias]) => !isPackageAlias(name, alias),
  );

  return [{ path: pathsLocation, value: record([...others, ...generated]) }];
}
