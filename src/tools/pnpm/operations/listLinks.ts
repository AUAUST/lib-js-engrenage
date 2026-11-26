import { join } from "node:path";

import { looseObject, string } from "valibot";

import { entries, keys } from "@auaust/toolkit/object";

import { packageJsonFile } from "#constants";
import { isMissingError, readJsonFile } from "#foundation/filesystem/index";
import { validate } from "#foundation/options/index";
import { checkBuildSources } from "#project/build/index";
import { modulesDirectory } from "#tools/pnpm/constants";
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

async function isStale(directory: Directory) {
  return (await checkBuildSources(directory)) !== "fresh";
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
 * build is older than its sources or unrecorded, and the peer dependencies `root`
 * installs at another version than the checkout.
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
