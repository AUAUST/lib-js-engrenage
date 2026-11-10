import { glob as globFiles, stat } from "node:fs/promises";
import { relative } from "node:path";

import { every, map, sort } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";

import { resolve, toPosixPath } from "#foundation/filesystem/index";
import { isPackageAlias } from "#project/tsconfig/utils/isPackageAlias";
import type { PathAlias } from "#project/tsconfig/types/PathAlias";
import type { PathAliases } from "#project/tsconfig/types/PathAliases";
import type { Paths } from "#project/tsconfig/types/Paths";
import type { Directory } from "#types/Directory";
import type { PackageName } from "#types/PackageName";

function toEntryName(
  packageName: PackageName,
  alias: string,
  isDirectoryEntry: boolean,
): string {
  const publicName = alias === packageName
    ? "index"
    : alias.slice(packageName.length + 1);

  return isDirectoryEntry ? `${publicName}/index` : publicName;
}

function countWildcards(pattern: string): number {
  return pattern.split("*").length - 1;
}

function assertWildcards(alias: string, targets: readonly string[]) {
  const counts = map([alias, ...targets], countWildcards);

  if (!every(counts, (count) => count === 1)) {
    throw new Error(
      `Alias '${alias}' and each of its targets need exactly one '*'`,
    );
  }
}

export async function resolvePathAliases(
  packageName: PackageName,
  paths: Paths,
  root: Directory | URL,
): Promise<PathAliases> {
  const rootPath = resolve(root);

  const aliases = new Map<string, PathAlias>();
  const entryPaths = new Map<string, string>();

  for (const [aliasPattern, targets] of entries(paths)) {
    if (!isPackageAlias(packageName, aliasPattern)) {
      continue;
    }

    const hasPattern = aliasPattern.includes("*");

    if (targets.length === 0) {
      throw new Error(`Alias '${aliasPattern}' has no configured paths`);
    }

    let matched = false;

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

      const matches = await Array.fromAsync(
        globFiles(pattern, {
          cwd: rootPath,
        }),
      );

      const isFile = await Promise.all(
        matches.map(async (match) => {
          const stats = await stat(resolve(rootPath, match));

          return stats.isFile();
        }),
      );

      const files = sort(matches.filter((_, index) => isFile[index]));

      for (const file of files) {
        const path = toPosixPath(file);

        const capture = path.slice(prefix.length, path.length - suffix.length);

        const alias = hasPattern
          ? aliasPattern.replace("*", () => capture)
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
