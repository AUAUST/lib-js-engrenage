import { extname, posix, relative } from "node:path";

import { memoize } from "@auaust/toolkit/function";
import { entries, getOwn, keys } from "@auaust/toolkit/object";

import { createScopeFinder } from "#batiment/scopes/index";
import { resolve, toPosixPath } from "#foundation/filesystem/index";
import type { Alias, ResolvedSpecifier } from "#batiment/structure/index";
import type { ScopeImports } from "#project/structure/types/ScopeImports";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

const aliasPrefix = "#";
const scopePrefix = "@";
const selfSubpath = ".";

function matchPattern(key: string, specifier: string): string | undefined {
  const star = key.indexOf("*");

  if (star === -1) {
    return specifier === key ? "" : undefined;
  }

  const prefix = key.slice(0, star);
  const suffix = key.slice(star + 1);

  return specifier.startsWith(prefix) &&
    specifier.endsWith(suffix) &&
    specifier.length >= prefix.length + suffix.length
    ? specifier.slice(prefix.length, specifier.length - suffix.length)
    : undefined;
}

function expandAlias(alias: Alias, specifier: string): string | undefined {
  const captured = matchPattern(alias.key, specifier);

  return captured === undefined
    ? undefined
    : alias.target.replace("*", () => captured);
}

function listModuleCandidates(
  path: string,
  extensions: readonly string[],
): string[] {
  const extension = extname(path);
  const stem = path.slice(0, path.length - extension.length);

  return [
    path,
    ...extensions.map((candidate) => `${path}${candidate}`),
    ...(extension === ""
      ? []
      : extensions.map((candidate) => `${stem}${candidate}`)),
    ...extensions.map((candidate) => posix.join(path, `index${candidate}`)),
  ];
}

function comparePatternKeys(first: string, second: string): number {
  return (
    second.indexOf("*") - first.indexOf("*") || second.length - first.length
  );
}

function isExported(
  exports: Readonly<Record<string, boolean>> | undefined,
  subpath: string,
): boolean {
  if (exports === undefined) {
    return true;
  }

  const exact = getOwn(exports, subpath);

  if (exact !== undefined) {
    return exact;
  }

  const [key] = keys(exports)
    .filter((candidate) => {
      return (
        candidate.includes("*") &&
        matchPattern(candidate, subpath) !== undefined
      );
    })
    .toSorted(comparePatternKeys);

  return key !== undefined && getOwn(exports, key) === true;
}

function packageNameOf(specifier: string): string {
  const segments = specifier.split("/");

  return specifier.startsWith(scopePrefix)
    ? segments.slice(0, 2).join("/")
    : (segments[0] ?? specifier);
}

/**
 * Resolves a relative or `#` alias specifier to the module file it names: the
 * expanded path itself, then with each of `extensions` appended, replacing
 * its extension, or as its directory's index, the first `isFile` accepts; the
 * expanded path when none does.
 */
export function createImportResolver({
  root,
  scopes,
  extensions,
  isFile,
}: {
  root: Directory;
  scopes: Readonly<Record<string, ScopeImports>>;
  extensions: readonly string[];
  isFile(file: File): boolean;
}): (specifier: string, from: File) => ResolvedSpecifier | undefined {
  const findScope = createScopeFinder(keys(scopes));

  const owners = new Map(
    entries(scopes).flatMap(([dir, { packageName }]) => {
      return packageName === undefined ? [] : [[packageName, dir] as const];
    }),
  );

  const classify = memoize(
    (scope: Directory, specifier: string) => {
      const imports = getOwn(scopes, scope);

      for (const alias of imports?.aliases ?? []) {
        const expanded = expandAlias(alias, specifier);

        if (expanded !== undefined) {
          return {
            kind: "alias",
            path: posix.join(scope, expanded),
            alias,
          } satisfies ResolvedSpecifier;
        }
      }

      if (specifier.startsWith(aliasPrefix)) {
        return;
      }

      const name = packageNameOf(specifier);
      const subpath = `${selfSubpath}${specifier.slice(name.length)}`;

      if (name === imports?.packageName) {
        return {
          kind: "self",
          subpath,
        } satisfies ResolvedSpecifier;
      }

      const owner = owners.get(name);

      if (owner !== undefined) {
        return {
          kind: "scope",
          scope: owner,
          subpath,
          exported: isExported(getOwn(scopes, owner)?.exports, subpath),
        } satisfies ResolvedSpecifier;
      }

      return {
        kind: "package",
        name: specifier.startsWith("node:") ? specifier : name,
      } satisfies ResolvedSpecifier;
    },
    (scope, specifier) => `${scope}\0${specifier}`,
  );

  const expandRelative = memoize(
    (directory: string, specifier: string): ResolvedSpecifier => {
      return {
        kind: "relative",
        path: posix.join(directory, specifier),
      };
    },
    (directory, specifier) => `${directory}\0${specifier}`,
  );

  function toModuleFile(resolved: ResolvedSpecifier): ResolvedSpecifier {
    if (resolved.kind !== "relative" && resolved.kind !== "alias") {
      return resolved;
    }

    const path = listModuleCandidates(resolved.path, extensions).find(isFile);

    return path === undefined || path === resolved.path
      ? resolved
      : { ...resolved, path };
  }

  return function resolveImport(specifier, from) {
    const file = toPosixPath(relative(root, resolve(root, from)));

    const resolved = specifier.startsWith(".")
      ? expandRelative(posix.dirname(file), specifier)
      : classify(findScope(file), specifier);

    return resolved === undefined ? undefined : toModuleFile(resolved);
  };
}
