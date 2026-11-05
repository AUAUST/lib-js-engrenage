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

// @debt section values live in `operations` because their resolvers call effectful operations, while the `config` role meant to own them is confined (#243–#246)
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
  const { resolve, context } = createResolver(raw, {
    root,
    filesystem,
    configFile,
    path(...paths: string[]) {
      return resolveWithin(root, ...paths);
    },
  });

  return freeze({
    resolve,
    context,
    raw,
  });
}
