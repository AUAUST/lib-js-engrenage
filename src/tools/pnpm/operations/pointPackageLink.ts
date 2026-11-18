import { rename, rm, symlink } from "node:fs/promises";

/**
 * Repoints the symlink at `path` to `target`, replacing it in one rename so an
 * interrupted run leaves the previous symlink in place.
 */
export async function pointPackageLink(
  path: string,
  target: string,
): Promise<void> {
  const staged = `${path}.engrenage-link`;

  await rm(staged, { force: true });

  await symlink(target, staged, "dir");

  await rename(staged, path);
}
