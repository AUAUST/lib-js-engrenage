import { join } from "node:path";

import { object, optional, string, union } from "valibot";

import { readJsonFile } from "#foundation/filesystem/index";
import { validate } from "#foundation/options/index";
import { parseManifestRepository } from "#tools/github/utils/parseManifestRepository";
import type { Directory } from "#types/Directory";

const manifestSchema = object({
  repository: optional(union([string(), object({ url: string() })])),
});

export async function readManifestRepository(
  directory: Directory,
): Promise<string | undefined> {
  const path = join(directory, "package.json");

  let manifest: unknown;

  try {
    manifest = await readJsonFile(path);
  } catch {
    // @debt treats any read failure as a missing manifest instead of telling a missing file from an unreadable one
    return;
  }

  const { repository } = validate(manifestSchema, manifest, path);

  return parseManifestRepository(repository);
}
