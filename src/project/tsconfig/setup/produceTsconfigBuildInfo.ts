import { relative } from "node:path";
import { basename } from "node:path/posix";

import { typescript } from "#constants";
import { toPosixPath } from "#filesystem/utils/toPosixPath";
import { toTsconfigSpecifier } from "#tsconfig/utils/toTsconfigSpecifier";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonEdit } from "#json/types/JsonEdit";
import type { TsconfigTarget } from "#tsconfig/types/TsconfigTarget";

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
