import type { Filesystem } from "#foundation/filesystem/types/Filesystem";
import type { ResolvedGit } from "#tools/git/types/ResolvedGit";

export function listFilesystems(config: {
  filesystem: Filesystem;
  git: ResolvedGit;
}): Filesystem[] {
  return [...new Set([config.filesystem, config.git.filesystem])];
}
