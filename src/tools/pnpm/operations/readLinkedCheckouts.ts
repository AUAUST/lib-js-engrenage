import { entries } from "@auaust/toolkit/object";

import { pathExists } from "#foundation/filesystem/index";
import { unlinkCommand } from "#tools/pnpm/constants";
import { readLinks } from "#tools/pnpm/operations/readLinks";
import type { LinkedCheckout } from "#tools/github/index";
import type { Directory } from "#types/Directory";

/**
 * The checkouts `root` links, by registered short name, for the issue checks
 * reading their commits.
 *
 * @throws {Error} When a recorded checkout no longer exists.
 */
export async function readLinkedCheckouts(
  root: Directory,
): Promise<Record<string, LinkedCheckout>> {
  const linked = entries(await readLinks(root));

  const presence = await Promise.all(
    linked.map(([, { directory }]) => pathExists(directory)),
  );

  const missing = linked.filter((_, index) => !presence[index]);

  if (missing.length > 0) {
    throw new Error(
      missing
        .map(([short, { directory }]) => {
          return `The checkout ${directory} linked to ${short} is missing: run \`${unlinkCommand} ${short}\``;
        })
        .join("\n"),
    );
  }

  return Object.fromEntries(
    linked.map(([short, { directory }]) => {
      return [short, { directory }];
    }),
  );
}
