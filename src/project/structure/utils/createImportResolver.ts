import { posix, relative } from "node:path";

import { memoize } from "@auaust/toolkit/function";
import { getOwn, keys } from "@auaust/toolkit/object";

import { rootScope } from "#batiment/scopes/constants";
import { resolve, toPosixPath } from "#foundation/filesystem/index";
import type { Alias, ResolvedSpecifier } from "#batiment/structure/index";
import type { ScopeImports } from "#project/structure/types/ScopeImports";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

const aliasPrefix = "#";
const scopePrefix = "@";
const selfSubpath = ".";

// @debt expands to the alias's single `.ts` target, so a `#…` import of a `.tsx` module resolves to a `.ts` path that does not exist, while a bundled `src` imports it through `types` listing both extensions
function expandAlias(alias: Alias, specifier: string): string | undefined {
  const star = alias.key.indexOf("*");

  if (star === -1) {
    return specifier === alias.key ? alias.target : undefined;
  }

  const prefix = alias.key.slice(0, star);
  const suffix = alias.key.slice(star + 1);

  return specifier.startsWith(prefix) &&
    specifier.endsWith(suffix) &&
    specifier.length >= prefix.length + suffix.length
    ? alias.target.replace("*", () => {
        return specifier.slice(prefix.length, specifier.length - suffix.length);
      })
    : undefined;
}

function packageNameOf(specifier: string): string {
  const segments = specifier.split("/");

  return specifier.startsWith(scopePrefix)
    ? segments.slice(0, 2).join("/")
    : (segments[0] ?? specifier);
}

function findScope(scopes: readonly Directory[], file: string): Directory {
  return (
    scopes.find((scope) => {
      return scope !== rootScope && file.startsWith(`${scope}/`);
    }) ?? rootScope
  );
}

export function createImportResolver({
  root,
  scopes,
}: {
  root: Directory;
  scopes: Readonly<Record<string, ScopeImports>>;
}): (specifier: string, from: File) => ResolvedSpecifier | undefined {
  const dirs = keys(scopes).sort((a, b) => b.length - a.length);

  const classify = memoize(
    (scope: Directory, specifier: string) => {
      const imports = getOwn(scopes, scope);
      const packageName = imports?.packageName;

      const table = imports === undefined
        ? []
        : [...imports.aliases.global, ...imports.aliases.src];

      for (const alias of table) {
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

      if (
        packageName !== undefined &&
        packageNameOf(specifier) === packageName
      ) {
        return {
          kind: "self",
          subpath: `${selfSubpath}${specifier.slice(packageName.length)}`,
        } satisfies ResolvedSpecifier;
      }

      return {
        kind: "package",
        name: specifier.startsWith("node:")
          ? specifier
          : packageNameOf(specifier),
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
      : classify(findScope(dirs, file), specifier);
  };
}
