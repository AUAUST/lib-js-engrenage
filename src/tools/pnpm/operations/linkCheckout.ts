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
import { linkedExecutables } from "#tools/pnpm/constants";
import { pointPackageLink } from "#tools/pnpm/operations/pointPackageLink";
import { readCheckoutManifest } from "#tools/pnpm/operations/readCheckoutManifest";
import { readLinks } from "#tools/pnpm/operations/readLinks";
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
 * Repoints the installed package of the registered repository `short` at its
 * checkout in `directory` and records the link with the symlink's previous target.
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

  const { name } = await readCheckoutManifest(checkout);

  if (!(await isDependency(root, name))) {
    throw new Error(
      `${name} is in neither dependencies nor devDependencies of ${join(root, packageJsonFile)}`,
    );
  }

  if (!(await pathExists(join(checkout, linkedExecutables)))) {
    throw new Error(
      `The checkout ${checkout} has no built ${linkedExecutables}: run \`pnpm build\` in it`,
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

  await pointPackageLink(symlink.path, checkout);

  await writeLinks(root, {
    ...links,
    [short]: {
      package: name,
      directory: checkout,
      installed,
    },
  });
}
