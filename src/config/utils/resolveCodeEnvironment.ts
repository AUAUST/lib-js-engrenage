import { freeze } from "@auaust/toolkit/object";

import { defaultDiscovered, defaultGenerated } from "#config/constants";
import { resolveListOption } from "#config/utils/resolveListOption";
import { filesIn } from "#utils/filesIn";
import type { Filesystem } from "#config/types/Filesystem";
import type { ListOption } from "#config/types/ListOption";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { Globs } from "#types/Globs";

interface CodeEnvironmentOption {
  dirs?: ListOption<Directory> | undefined;
  generated?: ListOption<string> | undefined;
  discovered?: ListOption<string> | undefined;
  defines?: boolean | undefined;
}

export function resolveCodeEnvironment({
  name,
  option,
  dirs: defaultDirs,
  defines: defaultDefines,
  typescriptFiles,
  filesystem,
}: {
  name: string;
  option: CodeEnvironmentOption | false | undefined;
  dirs: Directories;
  defines: boolean;
  typescriptFiles: Globs;
  filesystem: Filesystem;
}) {
  if (option === false) {
    return freeze({
      active: false,
      dirs: [],
      generated: [],
      discovered: [],
      defines: false,
      globs: [],
    });
  }

  const dirs = resolveListOption(
    option?.dirs,
    () => defaultDirs,
    `${name}.dirs`,
  );

  return freeze({
    active: dirs.some((directory) => filesystem.isDirectory(directory)),
    dirs,
    generated: resolveListOption(
      option?.generated,
      () => defaultGenerated,
      `${name}.generated`,
    ),
    discovered: resolveListOption(
      option?.discovered,
      () => defaultDiscovered,
      `${name}.discovered`,
    ),
    defines: option?.defines ?? defaultDefines,
    globs: filesIn(dirs, typescriptFiles),
  });
}
