import type { Filesystem } from "#foundation/filesystem/index";
import type { OptionContext } from "#foundation/options/index";
import type { ResolvedGit } from "#tools/git/index";

export async function listFilesystems({
  get,
}: OptionContext<{
  filesystem: Filesystem;
  git: ResolvedGit;
}>): Promise<Filesystem[]> {
  const git = await get("git");

  return [...new Set([await get("filesystem"), git.filesystem])];
}
