import { resolve } from "#support/filesystem/utils/resolve";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Glob } from "#types/Glob";
import { relativeWithin } from "#support/filesystem/utils/relativeWithin";
import { barrelFiles } from "#typescript/constants/barrelFiles";
import { typescriptBlocks } from "#typescript/constants/typescriptBlocks";
import type { SubpathImports } from "#typescript/types/SubpathImports";
import { readSubpathImports } from "#typescript/utils/readSubpathImports";
import { resolveImportSpecifier } from "#typescript/utils/resolveImportSpecifier";
import { syncBlocks } from "#utils/syncBlocks";
import { syncFiles } from "#utils/syncFiles";
import { map } from "@auaust/primitive-kit/arrays";
import { globSync } from "node:fs";
import { basename, dirname, extname } from "node:path";

function barrelName(file: File): string {
  return basename(dirname(file));
}

function createReexports(
  root: string,
  imports: SubpathImports,
  directory: Directory,
): string {
  const modules = globSync("*.ts", {
    cwd: resolve(root, directory),
  }).sort();

  const reexports = map(modules, (module) => {
    const specifier = resolveImportSpecifier(imports, `${directory}/${module}`);

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

  const reexports: string[] = [];

  for (const module of modules.sort()) {
    const path = resolve(cwd, module);

    if (path === barrel) {
      continue;
    }

    const specifier = resolveImportSpecifier(
      imports,
      relativeWithin(root, path),
    );

    const name = basename(module, extname(module));

    reexports.push(`export { default as ${name} } from "${specifier}";`);
  }

  return reexports.join("\n");
}

export function syncBarrels({
  root,
  barrels = [],
  check = false,
}: {
  root: Directory | URL;
  barrels?: string[];
  check?: boolean;
}): File[] {
  const rootPath = resolve(root);

  const imports = readSubpathImports(rootPath);

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
