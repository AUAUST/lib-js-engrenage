import { readFile } from "node:fs/promises";
import { findPackageJSON } from "node:module";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { looseObject, optional, parse, string, union } from "valibot";

import { isObject } from "@auaust/toolkit";

import { sourceCondition } from "#project/package/constants";

const manifestSchema = looseObject({
  name: string(),
  exports: optional(
    looseObject({
      ".": optional(
        union([
          string(),
          looseObject({ [sourceCondition]: optional(string()) }),
        ]),
      ),
    }),
  ),
});

async function resolveSourceRoot(url: string) {
  const manifestPath = findPackageJSON(url);

  if (manifestPath === undefined) {
    return;
  }

  const {
    name,
    exports,
  } = parse(manifestSchema, JSON.parse(await readFile(manifestPath, "utf-8")));

  const root = exports?.["."];

  const target = isObject(root) ? root[sourceCondition] : undefined;

  if (target !== undefined) {
    return {
      name,
      url: pathToFileURL(resolve(dirname(manifestPath), target)).href,
    };
  }
}

/**
 * Finds the source file a built executable defers to when Node runs with the
 * `source` condition, so a run never mixes built and source modules.
 *
 * @returns The source executable's URL, or `undefined` when the executable is
 * that source, its package declares no `source` export, or the condition is off.
 */
export async function findSourceExecutable(
  executable: { url: string; resolve(specifier: string): string },
  sourceSpecifier: string,
): Promise<string | undefined> {
  const sourceRoot = await resolveSourceRoot(executable.url);

  if (
    sourceRoot?.url === undefined ||
    executable.resolve(sourceRoot.name) !== sourceRoot.url
  ) {
    return;
  }

  const source = executable.resolve(sourceSpecifier);

  return source === executable.url ? undefined : source;
}
