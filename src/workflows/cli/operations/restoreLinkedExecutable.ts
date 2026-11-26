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
import { findLinkedConsumer } from "#workflows/cli/operations/findLinkedConsumer";
import type { Links } from "#tools/pnpm/index";

const manifestSchema = looseObject({ name: string() });

async function findCheckoutExecutable(
  executableUrl: string,
  links: Links,
  missing: readonly string[],
) {
  const manifest = findPackageJSON(executableUrl);

  if (manifest === undefined) {
    return;
  }

  const {
    name,
  } = validate(manifestSchema, await readJsonFile(manifest), manifest);

  const [short, link] = (
    entries(links).find(([, { package: linked }]) => {
      return linked === name;
    }) ?? []
  );

  if (short === undefined || link === undefined || missing.includes(short)) {
    return;
  }

  const [running, checkout, executable] = await Promise.all([
    realpath(dirname(manifest)),
    realpath(link.directory),
    realpath(fileURLToPath(executableUrl)),
  ]);

  if (running === checkout) {
    return;
  }

  const file = relative(running, executable);

  const target = join(checkout, file);

  if (!(await pathExists(target))) {
    throw new Error(
      `The checkout ${link.directory} linked to ${short} has no built ${file}: run \`pnpm build\` in it`,
    );
  }

  return pathToFileURL(target).href;
}

/**
 * Restores the links the project in the working directory records, which an
 * install may have replaced, and finds the executable of the linked checkout to
 * run instead of the running one when that one is another copy of its package;
 * loads nothing more when the project records no link.
 *
 * @returns The checkout executable's URL, or `undefined` to run on.
 * @throws {Error} When the checkout to run lacks the running executable's file.
 */
export async function restoreLinkedExecutable(
  executableUrl: string,
): Promise<string | undefined> {
  const consumer = await findLinkedConsumer();

  if (consumer === undefined) {
    return;
  }

  // @debt reading the record through the pnpm surface loads its built modules, and GitHub's and Git's, before the run defers to the sources
  const { readLinks, restoreLinks } = await import("#tools/pnpm/index");

  const { restored, missing } = await restoreLinks(consumer);

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

  return findCheckoutExecutable(
    executableUrl,
    await readLinks(consumer),
    missing,
  );
}
