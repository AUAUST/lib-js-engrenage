import type { InferOutput } from "valibot";

import { resolveWithin } from "#support/filesystem/utils/resolveWithin";
import type { configSchema } from "#config/config/schemas/configSchema";
import type { PackageInfo } from "#config/types/PackageInfo";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { TsconfigInfo } from "#config/types/TsconfigInfo";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export function createResolvedConfig({
  root,
  config,
  gitignorePath,
  package: packageInfo,
  packagePath,
  tsconfig,
  tsconfigPath,
}: {
  root: Directory;
  config: InferOutput<typeof configSchema>;
  gitignorePath: File;
  package: PackageInfo;
  packagePath: File;
  tsconfig: TsconfigInfo;
  tsconfigPath: File;
}): ResolvedConfig {
  function resolve(...paths: string[]): string {
    return resolveWithin(root, ...paths);
  }

  return {
    ...config,
    root,
    packagePath,
    tsconfigPath,
    gitignorePath,
    package: packageInfo,
    tsconfig,
    resolve,
  };
}
