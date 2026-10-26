import { globSync } from "node:fs";
import { basename, dirname, extname } from "node:path";

import { map } from "@auaust/primitive-kit/arrays";

import { relativeWithin } from "#support/filesystem/utils/relativeWithin";
import { resolve } from "#support/filesystem/utils/resolve";
import {
  barrelFiles,
  barrelModules,
  typescriptBlocks,
} from "#typescript/constants";
import { resolveImportSpecifier } from "#typescript/utils/resolveImportSpecifier";
import { compareNaturally } from "#utils/compareNaturally";
import { syncBlocks } from "#utils/syncBlocks";
import { syncFiles } from "#utils/syncFiles";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Glob } from "#types/Glob";
import type { SubpathImports } from "#typescript/types/SubpathImports";

function barrelName(file: File): string {
  return basename(dirname(file));
}

function createReexports(
  root: string,
  imports: SubpathImports,
  directory: Directory,
): string {
  const modules = globSync(barrelModules, {
    cwd: resolve(root, directory),
  });

  const specifiers = map(modules, (module) => {
    return resolveImportSpecifier(imports, `${directory}/${module}`);
  });

  const reexports = map(specifiers.sort(compareNaturally), (specifier) => {
    return `export * from "${specifier}";`;
  });

  return reexports.join("\n");
}

function createRegistry(
  root: string,
  imports: SubpathImports,
  barrel: File,
  glob: Glob,
): string {
  const isRootRelative = glob.startsWith("/");

  const cwd = isRootRelative ? root : dirname(barrel);

  const modules = globSync(isRootRelative ? glob.slice(1) : glob, {
    cwd,
  });

  const names = new Map<string, string>();

  for (const module of modules) {
    const path = resolve(cwd, module);

    if (path === barrel) {
      continue;
    }

    const specifier = resolveImportSpecifier(
      imports,
      relativeWithin(root, path),
    );

    names.set(specifier, basename(module, extname(module)));
  }

  const sortedNames = [...names].sort(([left], [right]) => {
    return compareNaturally(left, right);
  });

  const reexports = map(sortedNames, ([specifier, name]) => {
    return `export { default as ${name} } from "${specifier}";`;
  });

  return reexports.join("\n");
}

export function syncBarrels({
  config,
  barrels = [],
  check = false,
}: {
  config: ResolvedConfig;
  barrels?: string[];
  check?: boolean;
}): readonly File[] {
  const { root: rootPath } = config;

  const { imports } = config.packageJson;

  const allFiles = globSync(barrelFiles, {
    cwd: rootPath,
  }).sort();

  for (const name of barrels) {
    if (!allFiles.some((file) => barrelName(file) === name)) {
      throw new Error(`Unknown barrel "${name}"`);
    }
  }

  const files =
    barrels.length === 0
      ? allFiles
      : allFiles.filter((file) => barrels.includes(barrelName(file)));

  return syncFiles({
    root: rootPath,
    files,
    check,
    update(content, barrel) {
      return syncBlocks(content, typescriptBlocks, {
        reference(directory) {
          return createReexports(rootPath, imports, directory);
        },
        registry(glob) {
          return createRegistry(rootPath, imports, barrel, glob);
        },
      });
    },
  });
}
