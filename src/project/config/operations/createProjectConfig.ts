import { freeze } from "@auaust/toolkit/object";

import {
  createFilesystem,
  resolveWithin,
  type Filesystem,
} from "#foundation/filesystem/index";
import { createResolver } from "#foundation/options/index";
import type { LoadedConfig } from "#project/config/types/LoadedConfig";
import type { RawConfig } from "#project/config/types/RawConfig";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export function createProjectConfig({
  root,
  raw,
  configFile,
  filesystem = createFilesystem(root),
}: {
  root: Directory;
  raw: RawConfig;
  configFile: File | undefined;
  filesystem?: Filesystem;
}): LoadedConfig {
  const { resolve, context, validate } = createResolver(
    raw,
    {
      root,
      filesystem,
      configFile,
      path(...paths: string[]) {
        return resolveWithin(root, ...paths);
      },
    },
    {
      source: configFile ?? root,
    },
  );

  return freeze({
    resolve,
    context,
    validate,
  });
}
