import { realpath } from "node:fs/promises";
import { findPackageJSON } from "node:module";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { looseObject, string } from "valibot";

import { entries } from "@auaust/toolkit/object";

import { pathExists, readJsonFile } from "#foundation/filesystem/index";
import { validate } from "#foundation/options/index";
import { createConsoleReporter } from "#foundation/reports/index";
import { unlinkCommand } from "#tools/pnpm/constants";
import { enableSourceCondition } from "#workflows/cli/operations/enableSourceCondition";
import { findLinkedConsumer } from "#workflows/cli/operations/findLinkedConsumer";
import type { Link, Links } from "#tools/pnpm/index";
import type { Directory } from "#types/Directory";

const manifestSchema = looseObject({ name: string() });

async function readRealpath(directory: Directory) {
  try {
    return await realpath(directory);
  } catch {
    return;
  }
}

function warnRestored(restored: readonly string[], missing: readonly string[]) {
  const reporter = createConsoleReporter();

  if (restored.length > 0) {
    reporter.warn(
      `Restored the linked checkouts an install replaced: ${restored.join(", ")}.`,
    );
  }

  for (const short of missing) {
    reporter.warn(
      `The checkout linked to ${short} is missing, so the installed package runs: run \`${unlinkCommand} ${short}\``,
    );
  }
}

async function findCheckoutExecutable(
  executableUrl: string,
  running: string,
  checkout: string,
  [short, { directory }]: readonly [string, Link],
) {
  const file = relative(running, await realpath(fileURLToPath(executableUrl)));

  const target = join(checkout, file);

  if (!(await pathExists(target))) {
    throw new Error(
      `The checkout ${directory} linked to ${short} has no built ${file}: run \`pnpm build\` in it`,
    );
  }

  return pathToFileURL(target).href;
}

async function findLinkedPackage(manifest: string, links: Links) {
  const {
    name,
  } = validate(manifestSchema, await readJsonFile(manifest), manifest);

  return entries(links).find(([, { package: linked }]) => {
    return linked === name;
  });
}

/**
 * Restores the links the project in the working directory records, which an
 * install may have replaced, then finds the executable of the linked checkout to
 * run instead of the running one when that one is another copy of its package,
 * or switches the `source` condition on when the running package is a linked
 * checkout, so the run loads its sources instead of its build; loads nothing
 * more when the project records no link.
 *
 * @returns The checkout executable's URL, or `undefined` to run on.
 * @throws {Error} When the checkout to run lacks the running executable's file.
 */
export async function prepareLinkedRun(
  executableUrl: string,
): Promise<string | undefined> {
  const consumer = await findLinkedConsumer();

  if (consumer === undefined) {
    return;
  }

  // @debt reading the record through the pnpm surface loads its built modules, and GitHub's and Git's, before the run defers to the sources
  const { readLinks, restoreLinks } = await import("#tools/pnpm/index");

  const { restored, missing } = await restoreLinks(consumer);

  warnRestored(restored, missing);

  const manifest = findPackageJSON(executableUrl);

  if (manifest === undefined) {
    return;
  }

  const [
    links,
    running,
  ] = await Promise.all([readLinks(consumer), realpath(dirname(manifest))]);

  const checkouts = new Map(
    await Promise.all(
      entries(links).map(async ([short, { directory }]) => {
        return [short, await readRealpath(directory)] as const;
      }),
    ),
  );

  const linked = await findLinkedPackage(manifest, links);

  const checkout = linked && checkouts.get(linked[0]);

  if (linked && checkout !== undefined && checkout !== running) {
    return findCheckoutExecutable(executableUrl, running, checkout, linked);
  }

  if ([...checkouts.values()].includes(running)) {
    enableSourceCondition();
  }
}
