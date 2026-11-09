import { relative } from "node:path";
import { basename } from "node:path/posix";

import { toPosixPath } from "#foundation/filesystem/index";
import {
  toTsconfigSpecifier,
  type TsconfigTarget,
} from "#project/tsconfig/index";
import type { JsonEdit } from "#foundation/json/index";
import type { LoadedConfig } from "#project/config/index";

export async function produceTsconfigBuildInfo(
  config: LoadedConfig,
  { key, file }: TsconfigTarget,
): Promise<readonly JsonEdit[]> {
  if (key === "base") {
    return [];
  }

  const resources = await config.resolve("resources");

  const cacheDirectory = toPosixPath(
    relative(config.context.root, resources.path("cache.typescript")),
  );

  const buildInfo = `${cacheDirectory}/${basename(file, ".json")}.tsbuildinfo`;

  return [
    {
      path: ["compilerOptions", "incremental"],
      value: true,
    },
    {
      path: ["compilerOptions", "tsBuildInfoFile"],
      value: toTsconfigSpecifier(file, buildInfo),
    },
  ];
}
