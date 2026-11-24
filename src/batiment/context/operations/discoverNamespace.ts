import { posix } from "node:path";

import { map } from "@auaust/toolkit/array";
import { freeze } from "@auaust/toolkit/object";

import { hasUnignoredFile } from "#batiment/context/operations/hasUnignoredFile";
import { rootScope } from "#batiment/scopes/constants";
import {
  reconcileEnvironmentDirs,
  type EnvironmentClaim,
} from "#batiment/scopes/index";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { Globs } from "#types/Globs";

/**
 * Resolves the directories and root files of the top-level namespace `name`
 * placed in the scope at `scope`, relative to the project root, and whether they
 * hold an unignored file.
 */
export async function discoverNamespace({
  scope,
  name,
  dirs,
  files,
  claims,
  ignored,
  filesystem,
}: {
  scope: Directory;
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

  const kept = reconciled.filter((directory) => directory !== rootScope);

  const walked = map(kept, (directory) => posix.join(scope, directory));

  const rootFiles = kept.length === reconciled.length
    ? []
    : map(files, (glob) => posix.join(scope, glob));

  const active = await hasUnignoredFile({
    filesystem,
    ignored,
    dirs: walked,
    files: rootFiles,
  });

  return freeze({
    dirs: freeze(walked),
    rootFiles: freeze(rootFiles),
    active,
  });
}
