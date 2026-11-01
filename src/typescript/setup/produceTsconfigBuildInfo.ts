import { relative } from "node:path";
import { basename } from "node:path/posix";

import { typescript } from "#constants";
import { toPosixPath } from "#support/filesystem/utils/toPosixPath";
import { toTsconfigSpecifier } from "#typescript/utils/toTsconfigSpecifier";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonEdit } from "#support/json/types/JsonEdit";
import type { TsconfigTarget } from "#typescript/types/TsconfigTarget";

export function produceTsconfigBuildInfo(
  config: ResolvedConfig,
  { key, file }: TsconfigTarget,
): readonly JsonEdit[] {
  if (key === "base") {
    return [];
  }

  const cacheDirectory = toPosixPath(
    relative(config.root, config.cacheFor(typescript)),
  );

  const buildInfo = `${cacheDirectory}/${basename(file, ".json")}.tsbuildinfo`;

  return [
    {
      path: ["compilerOptions", "tsBuildInfoFile"],
      value: toTsconfigSpecifier(file, buildInfo),
    },
  ];
}
