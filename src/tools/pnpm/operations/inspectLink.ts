import { pathExists } from "#foundation/filesystem/index";
import { readPackageSymlink } from "#tools/pnpm/operations/readPackageSymlink";
import type { Link } from "#tools/pnpm/types/Link";
import type { LinkInspection } from "#tools/pnpm/types/LinkInspection";
import type { Directory } from "#types/Directory";

/**
 * Whether the checkout `link` records still exists and its package's symlink in
 * `root` still points at it.
 */
export async function inspectLink(
  root: Directory,
  link: Link,
): Promise<LinkInspection> {
  const [{ path, resolved }, present] = await Promise.all([
    readPackageSymlink(root, link.package),
    pathExists(link.directory),
  ]);

  return {
    path,
    resolved,
    present,
    holds: present && resolved === link.directory,
  };
}
