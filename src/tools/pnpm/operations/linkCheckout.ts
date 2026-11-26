import { realpath } from "node:fs/promises";
import { join } from "node:path";

import { looseObject, optional, record, string } from "valibot";

import { packageJsonFile } from "#constants";
import {
  pathExists,
  readJsonFile,
  resolve,
} from "#foundation/filesystem/index";
import { validate } from "#foundation/options/index";
import {
  findRegisteredRepository,
  readOriginRepository,
} from "#tools/github/index";
import { linkedExecutables, rebuildCommand } from "#tools/pnpm/constants";
import { pointPackageExecutables } from "#tools/pnpm/operations/pointPackageExecutables";
import { pointSymlink } from "#tools/pnpm/operations/pointSymlink";
import { readLinks } from "#tools/pnpm/operations/readLinks";
import { readPackageManifest } from "#tools/pnpm/operations/readPackageManifest";
import { readPackageSymlink } from "#tools/pnpm/operations/readPackageSymlink";
import { writeLinks } from "#tools/pnpm/operations/writeLinks";
import type { Directory } from "#types/Directory";

const consumerSchema = looseObject({
  dependencies: optional(record(string(), string())),
  devDependencies: optional(record(string(), string())),
});

async function isDependency(root: Directory, name: string) {
  const path = join(root, packageJsonFile);

  const {
    dependencies,
    devDependencies,
  } = validate(consumerSchema, await readJsonFile(path), path);

  return (
    dependencies?.[name] !== undefined || devDependencies?.[name] !== undefined
  );
}

/**
 * Repoints the installed package of the registered repository `short` and its
 * executables at its checkout in `directory` and records the link with the
 * symlink's previous target.
 *
 * @throws {Error} When `short` is unregistered, the checkout's `origin` is
 * another repository, its package is no dependency of `root`, it has no built
 * executables or its installed package is no symlink.
 */
export async function linkCheckout(
  {
    root,
    repositories,
  }: {
    root: Directory;
    repositories(): Promise<ReadonlyMap<string, string>>;
  },
  short: string,
  directory: Directory,
): Promise<void> {
  const repository = findRegisteredRepository(await repositories(), short);

  const checkout = await realpath(resolve(root, directory));

  const origin = await readOriginRepository(checkout);

  if (origin?.toLowerCase() !== repository.toLowerCase()) {
    throw new Error(
      `The checkout ${checkout} has ${origin === undefined ? "no GitHub `origin`" : `origin ${origin}`}, not ${repository}`,
    );
  }

  const manifest = await readPackageManifest(checkout);

  const { name } = manifest;

  if (!(await isDependency(root, name))) {
    throw new Error(
      `${name} is in neither dependencies nor devDependencies of ${join(root, packageJsonFile)}`,
    );
  }

  if (!(await pathExists(join(checkout, linkedExecutables)))) {
    throw new Error(
      `The checkout ${checkout} has no built ${linkedExecutables}: run \`${rebuildCommand}\` in it`,
    );
  }

  const symlink = await readPackageSymlink(root, name);

  if (symlink.target === undefined) {
    throw new Error(
      `${symlink.path} is no symlink: run \`pnpm install\` before linking`,
    );
  }

  const links = await readLinks(root);

  const installed = links[short]?.installed ?? symlink.target;

  await pointSymlink(symlink.path, checkout, "dir");

  await pointPackageExecutables(root, manifest);

  await writeLinks(root, {
    ...links,
    [short]: {
      package: name,
      directory: checkout,
      installed,
    },
  });
}
