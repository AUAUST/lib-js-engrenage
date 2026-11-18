import { entries } from "@auaust/toolkit/object";

import { restoreLinksCommand } from "#tools/pnpm/constants";
import { readLinkedPackage } from "#tools/pnpm/operations/readLinkedPackage";
import { readLinks } from "#tools/pnpm/operations/readLinks";
import type { LoadedConfig } from "#project/config/index";

/**
 * Fails when an install repointed a recorded link away from its checkout.
 */
export async function checkLinks({ context }: LoadedConfig): Promise<void> {
  const broken: string[] = [];

  for (const [short, { directory }] of entries(await readLinks(context.root))) {
    const { path, resolved } = await readLinkedPackage(context.root, directory);

    if (resolved !== directory) {
      broken.push(
        `- ${short}: ${path} points at ${resolved ?? "nothing"}, not ${directory}`,
      );
    }
  }

  if (broken.length > 0) {
    throw new Error(
      [
        `Linked checkouts lost their symlink: run \`${restoreLinksCommand}\``,
        ...broken,
      ].join("\n"),
    );
  }
}
