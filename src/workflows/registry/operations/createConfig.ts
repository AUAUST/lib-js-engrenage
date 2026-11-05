import {
  createFilesystem,
  type Filesystem,
} from "#foundation/filesystem/index";
import {
  createProjectConfig,
  type LoadedConfig,
  type RawConfig,
} from "#project/config/index";
import { formatContent } from "#project/format/index";
import { formatWithPrettier } from "#tools/prettier/adapters/formatWithPrettier";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export function createConfig({
  root,
  raw,
  configFile,
  filesystem = createFilesystem(root, (path, content) => {
    return formatContent(content, {
      path,
      root,
      formatter: formatWithPrettier,
    });
  }),
}: {
  root: Directory;
  raw: RawConfig;
  configFile: File | undefined;
  filesystem?: Filesystem;
}): LoadedConfig {
  return createProjectConfig({
    root,
    raw,
    configFile,
    filesystem,
  });
}
