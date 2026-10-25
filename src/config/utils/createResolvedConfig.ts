import type { InferOutput } from "valibot";

import { resolveWithin } from "#support/filesystem/utils/resolveWithin";
import type { configSchema } from "#config/config/schemas/configSchema";
import type { PackageInfo } from "#config/types/PackageInfo";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { TypescriptInfo } from "#config/types/TypescriptInfo";
import type { Directory } from "#types/Directory";

export function createResolvedConfig({
  root,
  config,
  package: packageInfo,
  typescript,
}: {
  root: Directory;
  config: InferOutput<typeof configSchema>;
  package: PackageInfo;
  typescript: TypescriptInfo;
}): ResolvedConfig {
  function resolve(...paths: string[]): string {
    return resolveWithin(root, ...paths);
  }

  return {
    ...config,
    root,
    package: packageInfo,
    typescript,
    resolve,
  };
}
