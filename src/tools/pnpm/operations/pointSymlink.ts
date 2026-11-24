import { rename, rm, symlink } from "node:fs/promises";

/**
 * Repoints the symlink at `path` to `target`, replacing what `path` holds in one
 * rename so an interrupted run leaves it in place.
 */
export async function pointSymlink(
  path: string,
  target: string,
  type: "dir" | "file",
): Promise<void> {
  const staged = `${path}.engrenage-link`;

  await rm(staged, { force: true });

  await symlink(target, staged, type);

  await rename(staged, path);
}
