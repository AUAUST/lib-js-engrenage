import { gitSection } from "#tools/git/index";
import type { Filesystem } from "#foundation/filesystem/index";
import type { LoadedConfig } from "#project/config/index";

export async function listFilesystems({
  resolve,
  context,
}: LoadedConfig): Promise<Filesystem[]> {
  const git = await resolve(gitSection);

  return [...new Set([context.filesystem, git.filesystem])];
}
