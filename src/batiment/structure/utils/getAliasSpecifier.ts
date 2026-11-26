import { posix } from "node:path";

import type { Alias } from "#batiment/structure/types/Alias";

function findModuleExtension(
  path: string,
  extensions: readonly string[],
): string | undefined {
  let found: string | undefined;

  for (const extension of extensions) {
    if (
      path.endsWith(extension) &&
      (found === undefined || extension.length > found.length)
    ) {
      found = extension;
    }
  }

  return found;
}

function matchTarget(key: string, target: string, path: string) {
  const star = target.indexOf("*");
  const keyStar = key.indexOf("*");

  if (star === -1 || keyStar === -1) {
    return star === -1 && keyStar === -1 && target === path ? key : undefined;
  }

  const prefix = target.slice(0, star);
  const suffix = target.slice(star + 1);

  if (
    path.startsWith(prefix) &&
    path.endsWith(suffix) &&
    path.length >= prefix.length + suffix.length
  ) {
    return key.replace("*", () => {
      return path.slice(prefix.length, path.length - suffix.length);
    });
  }
}

/**
 * The key of the first of `aliases` whose target names `path`, its `*` filled
 * in; a target ending in one of the module `extensions` names the module of any
 * of them, as `extensions` resolve an import of it.
 */
export function getAliasSpecifier(
  aliases: readonly Alias[],
  path: string,
  extensions: readonly string[],
) {
  const pathExtension = findModuleExtension(path, extensions);

  for (const { key, target } of aliases) {
    const normalized = posix.normalize(target);

    const targetExtension = findModuleExtension(normalized, extensions);

    const named = pathExtension === undefined || targetExtension === undefined
      ? path
      : `${path.slice(0, -pathExtension.length)}${targetExtension}`;

    const specifier = matchTarget(key, normalized, named);

    if (specifier !== undefined) {
      return specifier;
    }
  }
}
