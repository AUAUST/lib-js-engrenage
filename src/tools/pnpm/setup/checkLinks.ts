import { entries } from "@auaust/toolkit/object";

import { restoreLinksCommand, unlinkCommand } from "#tools/pnpm/constants";
import { inspectLink } from "#tools/pnpm/operations/inspectLink";
import { readLinks } from "#tools/pnpm/operations/readLinks";
import type { LoadedConfig } from "#project/config/index";

// @debt reports a link an install or a new checkout executable broke instead of anything repairing it, so every install needs a manual restore
/**
 * Fails when a recorded checkout is gone or an install repointed its link or
 * executables away from it.
 */
export async function checkLinks({ context }: LoadedConfig): Promise<void> {
  const broken: string[] = [];

  for (const [short, link] of entries(await readLinks(context.root))) {
    const {
      path,
      resolved = "nothing",
      present,
      executablesHold,
    } = await inspectLink(context.root, link);

    if (!present) {
      broken.push(
        `- ${short}: the checkout ${link.directory} is missing: run \`${unlinkCommand} ${short}\``,
      );
    } else if (resolved !== link.directory) {
      broken.push(
        `- ${short}: ${path} points at ${resolved}, not ${link.directory}: run \`${restoreLinksCommand}\``,
      );
    } else if (!executablesHold) {
      broken.push(
        `- ${short}: the executables of ${link.package} run another copy than ${link.directory}: run \`${restoreLinksCommand}\``,
      );
    }
  }

  if (broken.length > 0) {
    throw new Error(["Linked checkouts are broken:", ...broken].join("\n"));
  }
}
