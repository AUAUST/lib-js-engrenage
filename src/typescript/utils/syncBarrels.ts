import { globSync } from "node:fs";
import { basename, dirname, extname } from "node:path";

import { flatMap, map, sort, toSorted } from "@auaust/primitive-kit/arrays";

import { relativeWithin } from "#support/filesystem/utils/relativeWithin";
import { resolve } from "#support/filesystem/utils/resolve";
import { toPosixPath } from "#support/filesystem/utils/toPosixPath";
import {
  barrelFiles,
  declarationExtension,
  typescriptBlocks,
} from "#typescript/constants";
import { resolveImportSpecifier } from "#typescript/utils/resolveImportSpecifier";
import { syncBlocks } from "#utils/syncBlocks";
import { syncFiles } from "#utils/syncFiles";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Files } from "#types/Files";
import type { Glob } from "#types/Glob";
import type { SyncResults } from "#types/SyncResults";
import type { BarrelMode } from "#typescript/types/BarrelMode";
import type { SubpathImports } from "#typescript/types/SubpathImports";

const collator = new Intl.Collator("en-US", {
  numeric: true,
  sensitivity: "base",
});

const identifier = /^[$A-Z_a-z][\w$]*$/;

function compareNaturally(left: string, right: string): number {
  return collator.compare(left, right);
}

function createExport(
  mode: BarrelMode,
  name: string,
  specifier: string,
): string {
  switch (mode) {
    case "default":
      return `export { default as ${name} } from "${specifier}";`;
    case "named":
      return `export { ${name} } from "${specifier}";`;
    case "all":
      return `export * from "${specifier}";`;
  }
}

function assertMode(mode: string | undefined, barrel: File): BarrelMode {
  switch (mode) {
    case "default":
    case "named":
    case "all":
      return mode;
    default:
      throw new Error(
        `Expected a barrel mode (default, named or all) in ${barrel}, got "${mode ?? ""}"`,
      );
  }
}

function createBarrel({
  root,
  imports,
  barrel,
  glob,
  mode,
}: {
  root: Directory;
  imports: SubpathImports;
  barrel: File;
  glob: Glob;
  mode: BarrelMode;
}): string {
  const isRootRelative = glob.startsWith("/");

  const cwd = isRootRelative ? root : dirname(barrel);

  const modules = globSync(isRootRelative ? glob.slice(1) : glob, {
    cwd,
  });

  const names = new Map<string, string>();

  for (const module of modules) {
    const path = resolve(cwd, module);

    if (path === barrel || module.endsWith(declarationExtension)) {
      continue;
    }

    const specifier = resolveImportSpecifier(
      imports,
      relativeWithin(root, path),
    );

    names.set(specifier, basename(module, extname(module)));
  }

  const sortedNames = toSorted(names, ([left], [right]) => {
    return compareNaturally(left, right);
  });

  const exportedNames = new Set<string>();

  const exports = map(sortedNames, ([specifier, name]) => {
    if (mode !== "all") {
      if (!identifier.test(name)) {
        throw new Error(
          `"${specifier}" cannot be exported as "${name}" in ${barrel}`,
        );
      }

      if (exportedNames.has(name)) {
        throw new Error(`Several modules export "${name}" in ${barrel}`);
      }

      exportedNames.add(name);
    }

    return createExport(mode, name, specifier);
  });

  return exports.join("\n");
}

function selectBarrels(files: Files, name: string): Files {
  const byDirectory = files.filter((file) => {
    return dirname(file) === name;
  });

  if (byDirectory.length > 0) {
    return byDirectory;
  }

  const byName = files.filter((file) => {
    return basename(dirname(file)) === name;
  });

  if (byName.length === 0) {
    throw new Error(`Unknown barrel "${name}"`);
  }

  if (byName.length > 1) {
    throw new Error(
      `Barrel "${name}" is ambiguous (${byName.join(", ")}): name its directory instead`,
    );
  }

  return byName;
}

export function syncBarrels({
  config,
  barrels = [],
  check = false,
}: {
  config: ResolvedConfig;
  barrels?: ReadonlyArray<string>;
  check?: boolean;
}): SyncResults {
  const { root: rootPath } = config;

  const { imports } = config.packageJson;

  const discovered = globSync(
    map(config.directories.source, (directory) => {
      return `${directory}/${barrelFiles}`;
    }),
    {
      cwd: rootPath,
    },
  );

  const allFiles = sort(map(discovered, toPosixPath));

  const files =
    barrels.length === 0
      ? allFiles
      : flatMap(barrels, (name) => {
          return selectBarrels(allFiles, name);
        });

  function update(content: string, barrel: File): string {
    return syncBlocks(content, typescriptBlocks, {
      barrel(glob, mode) {
        return createBarrel({
          root: rootPath,
          imports,
          barrel,
          glob,
          mode: assertMode(mode, barrel),
        });
      },
    });
  }

  return syncFiles({
    root: rootPath,
    files: map(files, (file) => {
      return {
        file,
        update,
      };
    }),
    check,
  });
}
