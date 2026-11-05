import type { Filesystem } from "#foundation/filesystem/index";
import type { ResolvedGit } from "#tools/git/index";

export function listFilesystems(config: {
  filesystem: Filesystem;
  git: ResolvedGit;
}): Filesystem[] {
  return [...new Set([config.filesystem, config.git.filesystem])];
}
