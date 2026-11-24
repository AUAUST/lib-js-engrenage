import { pathExists } from "#foundation/filesystem/index";
import { readPackageManifest } from "#tools/pnpm/operations/readPackageManifest";
import { readPackageSymlink } from "#tools/pnpm/operations/readPackageSymlink";
import { readSymlinkTarget } from "#tools/pnpm/operations/readSymlinkTarget";
import { listExecutableLinks } from "#tools/pnpm/utils/listExecutableLinks";
import type { Link } from "#tools/pnpm/types/Link";
import type { LinkInspection } from "#tools/pnpm/types/LinkInspection";
import type { Directory } from "#types/Directory";

async function readExecutablesHold(root: Directory, directory: Directory) {
  const links = listExecutableLinks(root, await readPackageManifest(directory));

  const held = await Promise.all(
    links.map(async ({ path, target }) => {
      return (await readSymlinkTarget(path)) === target;
    }),
  );

  return held.every(Boolean);
}

/**
 * Whether the checkout `link` records still exists and its package's symlink and
 * executables in `root` still point at it.
 */
export async function inspectLink(
  root: Directory,
  link: Link,
): Promise<LinkInspection> {
  const [{ path, resolved }, present] = await Promise.all([
    readPackageSymlink(root, link.package),
    pathExists(link.directory),
  ]);

  const executablesHold = (
    present && (await readExecutablesHold(root, link.directory))
  );

  return {
    path,
    resolved,
    present,
    executablesHold,
    holds: present && resolved === link.directory && executablesHold,
  };
}
