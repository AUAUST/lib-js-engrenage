import { globSync, statSync } from "node:fs";
import { relative } from "node:path";

import { every, map, sort } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";

import { resolve } from "#support/filesystem/utils/resolve";
import { toPosixPath } from "#support/filesystem/utils/toPosixPath";
import type { Directory } from "#types/Directory";
import type { PackageName } from "#types/PackageName";
import type { PathAlias } from "#typescript/types/PathAlias";
import type { Paths } from "#typescript/types/Paths";

function toEntryName(
  packageName: PackageName,
  alias: string,
  isDirectoryEntry: boolean,
): string {
  const publicName =
    alias === packageName ? "index" : alias.slice(packageName.length + 1);

  return isDirectoryEntry ? `${publicName}/index` : publicName;
}

function countWildcards(pattern: string): number {
  return pattern.split("*").length - 1;
}

function assertPackageAlias(packageName: PackageName, alias: string) {
  if (alias !== packageName && !alias.startsWith(`${packageName}/`)) {
    throw new Error(
      `Alias '${alias}' is outside the package '${packageName}', so it cannot name an entry`,
    );
  }
}

function assertWildcards(alias: string, targets: ReadonlyArray<string>) {
  const counts = map([alias, ...targets], countWildcards);

  if (!every(counts, (count) => count === 1)) {
    throw new Error(
      `Alias '${alias}' and each of its targets need exactly one '*'`,
    );
  }
}

export function resolvePathAliases(
  packageName: PackageName,
  paths: Paths,
  root: Directory | URL,
): PathAlias[] {
  const rootPath = resolve(root);

  const aliases = new Map<string, PathAlias>();
  const entryPaths = new Map<string, string>();

  for (const [aliasPattern, targets] of entries(paths)) {
    const hasPattern = aliasPattern.includes("*");

    let matched = false;

    if (targets.length === 0) {
      throw new Error(`Alias '${aliasPattern}' has no configured paths`);
    }

    assertPackageAlias(packageName, aliasPattern);

    if (hasPattern) {
      assertWildcards(aliasPattern, targets);
    }

    for (const target of targets) {
      const pattern = toPosixPath(
        relative(rootPath, resolve(rootPath, target)),
      );

      const wildcard = pattern.indexOf("*");
      const prefix = pattern.slice(0, wildcard);
      const suffix = pattern.slice(wildcard + 1);

      const isDirectoryEntry = hasPattern && pattern.endsWith("*/index.ts");

      const matches = globSync(pattern, {
        cwd: rootPath,
      });

      const files = sort(
        matches.filter((match) => {
          return statSync(resolve(rootPath, match)).isFile();
        }),
      );

      for (const file of files) {
        const path = toPosixPath(file);

        const capture = path.slice(prefix.length, path.length - suffix.length);

        const alias = hasPattern
          ? aliasPattern.replace("*", capture)
          : aliasPattern;

        const previousAlias = aliases.get(alias);

        if (previousAlias) {
          throw new Error(
            `Alias conflict for '${alias}': '${previousAlias.path}' and '${path}'`,
          );
        }

        const name = toEntryName(packageName, alias, isDirectoryEntry);

        const previousEntryPath = entryPaths.get(name);

        if (previousEntryPath) {
          throw new Error(
            `Entrypoint conflict for '${name}': '${previousEntryPath}' and '${path}'`,
          );
        }

        entryPaths.set(name, path);

        aliases.set(alias, {
          alias,
          name,
          path,
        });

        matched = true;
      }
    }

    if (!hasPattern && !matched) {
      throw new Error(`Alias '${aliasPattern}' does not resolve to a file`);
    }
  }

  return [...aliases.values()];
}
