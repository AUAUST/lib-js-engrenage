import { restoreLinksCommand, unlinkCommand } from "#tools/pnpm/constants";
import {
  findLinksRoot,
  linkCheckout,
  listLinks,
  restoreLinks,
  unlinkCheckout,
} from "#tools/pnpm/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";
import type { LoadedConfig } from "#project/config/index";

async function link(
  config: LoadedConfig,
  repository: string,
  directory: string,
) {
  const { repositories } = await config.resolve("github");

  await linkCheckout(
    { root: config.context.root, repositories },
    repository,
    directory,
  );

  getRunContext().reporter.log(`Linked ${repository} to ${directory}.`);
}

async function list(root: string) {
  const { reporter } = getRunContext();

  const links = await listLinks(root);

  if (links.length === 0) {
    return void reporter.log("No linked checkout.");
  }

  for (const { short, directory, present, holds, stale, peers } of links) {
    reporter.log(`${short}: ${directory}`);

    if (!present) {
      reporter.warn(
        `${short}: the checkout is missing: run \`${unlinkCommand} ${short}\``,
      );
    } else if (!holds) {
      reporter.warn(
        `${short}: the installed package no longer points at the checkout: run \`${restoreLinksCommand}\``,
      );
    }

    if (stale) {
      reporter.warn(
        `${short}: the checkout's build predates its HEAD commit: run \`pnpm build\` in it`,
      );
    }

    for (const { name, installed, linked } of peers) {
      reporter.warn(
        `${short}: peer dependency ${name} is ${installed} here and ${linked} in the checkout`,
      );
    }
  }
}

export default async function (
  repository: string | undefined,
  directory: string | undefined,
  { remove, restore }: { remove?: string | undefined; restore: boolean },
): Promise<void> {
  const { reporter } = getRunContext();

  const cwd = process.cwd();

  if (repository !== undefined) {
    if (directory === undefined) {
      throw new Error(
        "Expected `engrenage link <repository> <directory>`, `--remove <repository>` or `--restore`",
      );
    }

    const config = await loadValidatedConfig(cwd, { reporter });

    return link(config, repository, directory);
  }

  const root = (await findLinksRoot(cwd)) ?? cwd;

  if (remove !== undefined) {
    await unlinkCheckout(root, remove);

    return void reporter.log(`Restored the installed package of ${remove}.`);
  }

  if (restore) {
    const restored = await restoreLinks(root);

    return void reporter.log(
      restored.length === 0
        ? "Every link holds."
        : `Restored ${restored.join(", ")}.`,
    );
  }

  return list(root);
}
