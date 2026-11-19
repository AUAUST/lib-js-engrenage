import { entries } from "@auaust/toolkit/object";

import { restoreLinksCommand, unlinkCommand } from "#tools/pnpm/constants";
import { inspectLink } from "#tools/pnpm/operations/inspectLink";
import { readLinks } from "#tools/pnpm/operations/readLinks";
import type { LoadedConfig } from "#project/config/index";

/**
 * Fails when a recorded checkout is gone or an install repointed its
 * link away from it.
 */
export async function checkLinks({ context }: LoadedConfig): Promise<void> {
  const broken: string[] = [];

  for (const [short, link] of entries(await readLinks(context.root))) {
    const {
      path,
      resolved = "nothing",
      present,
      holds,
    } = await inspectLink(context.root, link);

    if (!present) {
      broken.push(
        `- ${short}: the checkout ${link.directory} is missing: run \`${unlinkCommand} ${short}\``,
      );
    } else if (!holds) {
      broken.push(
        `- ${short}: ${path} points at ${resolved}, not ${link.directory}: run \`${restoreLinksCommand}\``,
      );
    }
  }

  if (broken.length > 0) {
    throw new Error(["Linked checkouts are broken:", ...broken].join("\n"));
  }
}
