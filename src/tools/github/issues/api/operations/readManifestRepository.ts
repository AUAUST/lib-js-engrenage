import { join } from "node:path";

import { object, optional, string, union } from "valibot";

import { isString } from "@auaust/toolkit/isString";

import { readJsonFile } from "#foundation/filesystem/index";
import { validate } from "#foundation/options/index";
import { parseRepository } from "#tools/github/issues/api/utils/parseRepository";
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

  return parseRepository(
    isString(repository) ? repository : (repository?.url ?? ""),
  );
}
