import { posix, relative } from "node:path";

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

// @debt expands to the alias's single `.ts` target, so a `#…` import of a `.tsx` module resolves to a `.ts` path that does not exist, while a bundled `src` imports it through `types` listing both extensions
function expandAlias(alias: Alias, specifier: string): string | undefined {
  const captured = matchPattern(alias.key, specifier);

  return captured === undefined
    ? undefined
    : alias.target.replace("*", () => captured);
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

export function createImportResolver({
  root,
  scopes,
}: {
  root: Directory;
  scopes: Readonly<Record<string, ScopeImports>>;
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

  return function resolveImport(specifier, from) {
    const file = toPosixPath(relative(root, resolve(root, from)));

    return specifier.startsWith(".")
      ? expandRelative(posix.dirname(file), specifier)
      : classify(findScope(file), specifier);
  };
}
