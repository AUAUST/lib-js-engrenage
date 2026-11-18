import { readlink } from "node:fs/promises";
import { dirname, join } from "node:path";

import { looseObject, optional, record, string } from "valibot";

import { get } from "@auaust/toolkit/object";

import { packageJsonFile } from "#constants";
import {
  isMissingError,
  readJsonFile,
  resolve,
} from "#foundation/filesystem/index";
import { validate } from "#foundation/options/index";
import { modulesDirectory } from "#tools/pnpm/constants";
import type { Directory } from "#types/Directory";

const manifestSchema = looseObject({
  name: string(),
  peerDependencies: optional(record(string(), string())),
});

async function readTarget(path: string) {
  try {
    return await readlink(path);
  } catch (error) {
    if (isMissingError(error) || get(error, "code") === "EINVAL") {
      return;
    }

    throw error;
  }
}

/**
 * The package of the checkout at `directory` and the symlink `root` installs
 * it at, with the symlink's raw and resolved targets, `undefined` when the
 * path holds no symlink.
 */
export async function readLinkedPackage(root: Directory, directory: Directory) {
  const manifestPath = join(directory, packageJsonFile);

  const manifest = validate(
    manifestSchema,
    await readJsonFile(manifestPath),
    manifestPath,
  );

  const path = join(root, modulesDirectory, manifest.name);

  const target = await readTarget(path);

  return {
    manifest,
    path,
    target,
    resolved: target === undefined ? undefined : resolve(dirname(path), target),
  };
}
