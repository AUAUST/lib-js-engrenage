import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname } from "node:path";

import { parse, record, string, union } from "valibot";

import { isString } from "@auaust/toolkit/isString";
import { get } from "@auaust/toolkit/object";

import { packageJsonFile } from "#constants";
import { resolve } from "#foundation/filesystem/index";
import { readJsonValue } from "#foundation/json/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { KnownPackageName } from "#types/KnownPackageName";

const binSchema = union([string(), record(string(), string())]);

function isModuleNotFound(error: unknown): boolean {
  return error instanceof Error && get(error, "code") === "MODULE_NOT_FOUND";
}

function resolveManifest(root: Directory, packageName: KnownPackageName): File {
  const require = createRequire(resolve(root, packageJsonFile));

  try {
    return require.resolve(`${packageName}/${packageJsonFile}`);
  } catch (error) {
    if (!isModuleNotFound(error)) {
      throw error;
    }

    throw new Error(`Install ${packageName} in ${root} to run it`, {
      cause: error,
    });
  }
}

export function resolveBinary(
  root: Directory,
  packageName: KnownPackageName,
  binary: string,
): File {
  const manifestPath = resolveManifest(root, packageName);

  const bin = readJsonValue(readFileSync(manifestPath, "utf-8"), manifestPath, [
    "bin",
  ]);

  const paths = bin === undefined ? undefined : parse(binSchema, bin);

  const path = isString(paths) ? paths : paths?.[binary];

  if (path === undefined) {
    throw new Error(`${manifestPath} declares no "${binary}" binary`);
  }

  return resolve(dirname(manifestPath), path);
}
