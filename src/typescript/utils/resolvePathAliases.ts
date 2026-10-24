import type { Directory } from "#types/Directory";
import type { PackageName } from "#types/PackageName";
import type { PathAlias } from "#typescript/types/PathAlias";
import type { Paths } from "#typescript/types/Paths";
import { resolvePath } from "#utils/resolvePath";
import { entries } from "@auaust/toolkit/object";
import { globSync } from "node:fs";
import { relative } from "node:path";

function toPosixPath(path: string): string {
  return path.replaceAll("\\", "/");
}

function toEntryName(
  packageName: PackageName,
  alias: string,
  isDirectoryEntry: boolean,
): string {
  const publicName =
    alias === packageName ? "index" : alias.slice(packageName.length + 1);

  return isDirectoryEntry ? `${publicName}/index` : publicName;
}

export function resolvePathAliases(
  packageName: PackageName,
  paths: Paths,
  root: Directory | URL,
): PathAlias[] {
  const rootPath = resolvePath(root);

  const aliases = new Map<string, PathAlias>();
  const entryPaths = new Map<string, string>();

  for (const [aliasPattern, targets] of entries(paths)) {
    const hasPattern = aliasPattern.includes("*");

    let matched = false;

    if (targets.length === 0) {
      throw new Error(`Alias '${aliasPattern}' has no configured paths`);
    }

    for (const target of targets) {
      const pattern = toPosixPath(
        relative(rootPath, resolvePath(rootPath, target)),
      );

      const wildcard = pattern.indexOf("*");
      const prefix = pattern.slice(0, wildcard);
      const suffix = pattern.slice(wildcard + 1);

      const isDirectoryEntry = hasPattern && pattern.endsWith("*/index.ts");

      const files = globSync(pattern, {
        cwd: rootPath,
      }).sort();

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
