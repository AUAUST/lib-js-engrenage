import { relative } from "node:path";
import { basename } from "node:path/posix";

import { typescript } from "#constants";
import { toPosixPath } from "#foundation/filesystem/utils/toPosixPath";
import { toTsconfigSpecifier } from "#project/tsconfig/utils/toTsconfigSpecifier";
import type { JsonEdit } from "#foundation/json/types/JsonEdit";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";

export function produceTsconfigBuildInfo(
  config: ProjectConfig,
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
