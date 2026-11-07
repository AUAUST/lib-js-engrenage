import { relative } from "node:path";
import { basename } from "node:path/posix";

import { typescript } from "#constants";
import { toPosixPath } from "#foundation/filesystem/index";
import { cacheSection } from "#project/cache/index";
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

  const cache = await config.resolve(cacheSection);

  const cacheDirectory = toPosixPath(
    relative(config.context.root, cache.for(typescript)),
  );

  const buildInfo = `${cacheDirectory}/${basename(file, ".json")}.tsbuildinfo`;

  return [
    {
      path: ["compilerOptions", "tsBuildInfoFile"],
      value: toTsconfigSpecifier(file, buildInfo),
    },
  ];
}
