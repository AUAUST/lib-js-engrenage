import { join } from "node:path";

import { looseObject, optional, record, string } from "valibot";

import { packageJsonFile } from "#constants";
import { readJsonFile } from "#foundation/filesystem/index";
import { validate } from "#foundation/options/index";
import type { Directory } from "#types/Directory";

const manifestSchema = looseObject({
  name: string(),
  peerDependencies: optional(record(string(), string())),
});

/**
 * The package name and peer dependencies of the checkout at `directory`.
 */
export async function readCheckoutManifest(directory: Directory) {
  const path = join(directory, packageJsonFile);

  return validate(manifestSchema, await readJsonFile(path), path);
}
