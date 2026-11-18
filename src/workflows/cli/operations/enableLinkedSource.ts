import { realpath } from "node:fs/promises";
import { findPackageJSON, registerHooks } from "node:module";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";

import { pathExists, resolve } from "#foundation/filesystem/index";
import { hasNodeCondition } from "#foundation/processes/index";
import { sourceCondition } from "#project/package/constants";
import { linksFile } from "#tools/pnpm/constants";
import type { Directory } from "#types/Directory";

async function readRealpath(directory: Directory) {
  try {
    return await realpath(directory);
  } catch {
    return;
  }
}

async function isLinked(consumer: Directory, executableUrl: string) {
  const running = findPackageJSON(executableUrl);

  if (
    running === undefined ||
    !(await pathExists(resolve(consumer, linksFile)))
  ) {
    return false;
  }

  // @debt reading the record through the pnpm surface loads its built modules, and GitHub's and Git's, before the run defers to the sources
  const { readLinks } = await import("#tools/pnpm/index");

  const [
    links,
    directory,
  ] = await Promise.all([readLinks(consumer), realpath(dirname(running))]);

  const linked = await Promise.all(
    Object.values(links).map(({ directory: checkout }) => {
      return readRealpath(checkout);
    }),
  );

  return linked.includes(directory);
}

/**
 * Switches the `source` condition on for the current process and the ones it
 * starts when the project in the working directory links the running package to
 * a checkout, so the run loads that checkout's sources instead of its build.
 */
export async function enableLinkedSource(executableUrl: string): Promise<void> {
  if (hasNodeCondition(sourceCondition)) {
    return;
  }

  const manifest = findPackageJSON(pathToFileURL(`${process.cwd()}/`).href);

  if (
    manifest === undefined ||
    !(await isLinked(dirname(manifest), executableUrl))
  ) {
    return;
  }

  registerHooks({
    resolve(specifier, context, next) {
      return next(
        specifier,
        context.conditions?.includes(sourceCondition)
          ? context
          : {
              ...context,
              conditions: [...(context.conditions ?? []), sourceCondition],
            },
      );
    },
  });

  process.env.NODE_OPTIONS = [
    process.env.NODE_OPTIONS,
    `--conditions=${sourceCondition}`,
  ]
    .filter(Boolean)
    .join(" ");
}
