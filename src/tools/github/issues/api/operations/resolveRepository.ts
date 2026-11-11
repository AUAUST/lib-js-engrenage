import { join } from "node:path";

import { object, optional, string, union } from "valibot";

import { isString } from "@auaust/toolkit/isString";

import { readJsonFile } from "#foundation/filesystem/index";
import { validate } from "#foundation/options/index";
import { runGit } from "#tools/git/index";
import { parseRepository } from "#tools/github/issues/api/utils/parseRepository";
import type { Directory } from "#types/Directory";

const manifestSchema = object({
  repository: optional(union([string(), object({ url: string() })])),
});

async function readManifestRepository(root: Directory) {
  let manifest: unknown;

  try {
    manifest = await readJsonFile(join(root, "package.json"));
  } catch {
    return;
  }

  const { repository } = validate(manifestSchema, manifest, "package.json");

  return parseRepository(
    isString(repository) ? repository : (repository?.url ?? ""),
  );
}

export async function resolveRepository(
  root: Directory,
  explicit?: string,
): Promise<string> {
  const repository = (
    explicit ??
    (await readManifestRepository(root)) ??
    parseRepository(await runGit(root, ["remote", "get-url", "origin"]))
  );

  if (repository === undefined) {
    throw new Error(
      "Cannot tell the GitHub repository: pass --repo <owner/repo>, or set `repository` in package.json",
    );
  }

  return repository;
}
