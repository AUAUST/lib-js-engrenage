import { freeze } from "@auaust/toolkit/object";

import { hasUnignoredFile } from "#batiment/context/operations/hasUnignoredFile";
import { rootScope } from "#batiment/scopes/constants";
import {
  reconcileEnvironmentDirs,
  type EnvironmentClaim,
} from "#batiment/scopes/index";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Directories } from "#types/Directories";
import type { Globs } from "#types/Globs";

export async function discoverNamespace({
  name,
  dirs,
  files,
  claims,
  ignored,
  filesystem,
}: {
  name: string;
  dirs: Directories;
  files: Globs;
  claims: Readonly<Record<string, EnvironmentClaim>>;
  ignored: Globs;
  filesystem: Filesystem;
}): Promise<{
  readonly dirs: Directories;
  readonly rootFiles: Globs;
  readonly active: boolean;
}> {
  const reconciled = reconcileEnvironmentDirs(name, dirs, claims);

  const walked = reconciled.filter((directory) => directory !== rootScope);

  const rootFiles = walked.length === reconciled.length ? [] : files;

  const active = await hasUnignoredFile({
    filesystem,
    ignored,
    dirs: walked,
    files: rootFiles,
  });

  return freeze({
    dirs: freeze(walked),
    rootFiles: freeze([...rootFiles]),
    active,
  });
}
