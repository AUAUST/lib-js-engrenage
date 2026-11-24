import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

import { looseObject, string } from "valibot";

import { entries, keys } from "@auaust/toolkit/object";

import { packageJsonFile } from "#constants";
import { isMissingError, readJsonFile } from "#foundation/filesystem/index";
import { validate } from "#foundation/options/index";
import { runGit } from "#tools/git/index";
import { linkedOutput, modulesDirectory } from "#tools/pnpm/constants";
import { inspectLink } from "#tools/pnpm/operations/inspectLink";
import { readLinks } from "#tools/pnpm/operations/readLinks";
import { readPackageManifest } from "#tools/pnpm/operations/readPackageManifest";
import type { LinkState } from "#tools/pnpm/types/LinkState";
import type { Directory } from "#types/Directory";

const versionSchema = looseObject({ version: string() });

async function readInstalledVersion(root: Directory, name: string) {
  const path = join(root, modulesDirectory, name, packageJsonFile);

  try {
    return validate(versionSchema, await readJsonFile(path), path).version;
  } catch (error) {
    if (isMissingError(error)) {
      return;
    }

    throw error;
  }
}

async function readBuildTime(directory: Directory) {
  const output = join(directory, linkedOutput);

  let files: string[];

  try {
    files = await readdir(output, { recursive: true });
  } catch (error) {
    if (isMissingError(error)) {
      return;
    }

    throw error;
  }

  const stats = await Promise.all(
    files.map((file) => stat(join(output, file))),
  );

  return Math.max(0, ...stats.map(({ mtimeMs }) => mtimeMs));
}

async function isStale(directory: Directory) {
  const [built, committed] = await Promise.all([
    readBuildTime(directory),
    runGit(directory, ["log", "-1", "--format=%ct", "HEAD"]),
  ]);

  return built === undefined || built < Number(committed) * 1000;
}

async function listPeerMismatches(
  root: Directory,
  directory: Directory,
  peers: Readonly<Record<string, string>>,
) {
  const versions = await Promise.all(
    keys(peers).map(async (name) => {
      return {
        name,
        installed: await readInstalledVersion(root, name),
        linked: await readInstalledVersion(directory, name),
      };
    }),
  );

  return versions.flatMap(({ name, installed, linked }) => {
    return installed === undefined ||
      linked === undefined ||
      installed === linked
      ? []
      : {
          name,
          installed,
          linked,
        };
  });
}

/**
 * The state of every link `root` records: whether its checkout still exists,
 * whether its symlink and executables still point at it, whether the checkout's
 * build predates its `HEAD` commit, and the peer dependencies `root` installs at
 * another version than the checkout.
 */
export async function listLinks(root: Directory): Promise<LinkState[]> {
  return Promise.all(
    entries(await readLinks(root)).map(async ([short, link]) => {
      const { directory } = link;

      const { present, holds } = await inspectLink(root, link);

      if (!present) {
        return {
          short,
          directory,
          present,
          holds,
          stale: false,
          peers: [],
        };
      }

      const manifest = await readPackageManifest(directory);

      const [stale, peers] = await Promise.all([
        isStale(directory),
        listPeerMismatches(root, directory, manifest.peerDependencies ?? {}),
      ]);

      return {
        short,
        directory,
        present,
        holds,
        stale,
        peers,
      };
    }),
  );
}
