import { posix, relative } from "node:path";

import { memoize } from "@auaust/toolkit/function";

import { resolve, toPosixPath } from "#foundation/filesystem/index";
import type {
  Alias,
  ResolvedAliases,
  ResolvedSpecifier,
} from "#batiment/structure/index";
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

export function createImportResolver({
  root,
  aliases,
  packageName,
}: {
  root: Directory;
  aliases: ResolvedAliases;
  packageName?: string | undefined;
}): (specifier: string, from: File) => ResolvedSpecifier | undefined {
  const table = [...aliases.global, ...aliases.src];

  const classify = memoize((specifier: string) => {
    for (const alias of table) {
      const expanded = expandAlias(alias, specifier);

      if (expanded !== undefined) {
        return {
          kind: "alias",
          path: posix.normalize(expanded),
          alias,
        } satisfies ResolvedSpecifier;
      }
    }

    if (specifier.startsWith(aliasPrefix)) {
      return;
    }

    if (packageName !== undefined && packageNameOf(specifier) === packageName) {
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
  });

  const expandRelative = memoize(
    (directory: string, specifier: string): ResolvedSpecifier => {
      const base = toPosixPath(relative(root, resolve(root, directory)));

      return {
        kind: "relative",
        path: posix.join(base, specifier),
      };
    },
    (directory, specifier) => `${directory}\0${specifier}`,
  );

  return function resolveImport(specifier, from) {
    return specifier.startsWith(".")
      ? expandRelative(posix.dirname(toPosixPath(from)), specifier)
      : classify(specifier);
  };
}
