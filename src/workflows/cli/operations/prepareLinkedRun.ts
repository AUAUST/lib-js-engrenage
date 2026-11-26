import { realpath } from "node:fs/promises";
import { findPackageJSON } from "node:module";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { looseObject, string } from "valibot";

import { entries } from "@auaust/toolkit/object";

import { pathExists, readJsonFile } from "#foundation/filesystem/index";
import { validate } from "#foundation/options/index";
import { createConsoleReporter } from "#foundation/reports/index";
import { rebuildCommand, unlinkCommand } from "#tools/pnpm/constants";
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
      `The checkout ${directory} linked to ${short} has no built ${file}: run \`${rebuildCommand}\` in it`,
    );
  }

  return pathToFileURL(target).href;
}

// @debt digests every source the build consumed on each run, and twice when the run defers to the checkout's executable, which checks again
async function assertFreshBuild(
  checkout: string,
  [short, { directory }]: readonly [string, Link],
) {
  const { checkBuildSources } = await import("#project/build/index");

  const state = await checkBuildSources(checkout);

  if (state === "unrecorded") {
    throw new Error(
      `The checkout ${directory} linked to ${short} has no record of the sources its build consumed, so its build may be stale: run \`${rebuildCommand}\` in it`,
    );
  }

  if (state === "stale") {
    throw new Error(
      `The build of the checkout ${directory} linked to ${short} is older than its sources, so this run stops before running stale code: run \`${rebuildCommand}\` in it`,
    );
  }
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
 * install may have replaced, then, when the running package is linked, checks that
 * the checkout's build matches its sources and finds the checkout's executable to
 * run instead of the running one when that one is another copy of its package;
 * loads nothing more when the project records no link.
 *
 * @returns The checkout executable's URL, or `undefined` to run on.
 * @throws {Error} When the checkout's build is older than its sources or
 * unrecorded, or lacks the running executable's file.
 */
export async function prepareLinkedRun(
  executableUrl: string,
): Promise<string | undefined> {
  const consumer = await findLinkedConsumer();

  if (consumer === undefined) {
    return;
  }

  // @debt reading the record through the pnpm surface loads its modules, and GitHub's and Git's, on every run of a project recording links
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

  const linked = await findLinkedPackage(manifest, links);

  if (linked === undefined) {
    return;
  }

  const checkout = await readRealpath(linked[1].directory);

  if (checkout === undefined) {
    return;
  }

  await assertFreshBuild(checkout, linked);

  return checkout === running
    ? undefined
    : findCheckoutExecutable(executableUrl, running, checkout, linked);
}
