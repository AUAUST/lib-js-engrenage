import { barrelFiles } from "#config/typescript/barrelFiles";
import { typescriptBlocks } from "#config/typescript/typescriptBlocks";
import type { SubpathImports } from "#typescript/types/SubpathImports";
import { readSubpathImports } from "#typescript/utils/readSubpathImports";
import { resolveImportSpecifier } from "#typescript/utils/resolveImportSpecifier";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import { resolvePath } from "#utils/resolvePath";
import { syncBlocks } from "#utils/syncBlocks";
import { syncFiles } from "#utils/syncFiles";
import { map } from "@auaust/primitive-kit/arrays";
import { globSync } from "node:fs";
import { basename, dirname } from "node:path";

function barrelName(file: File): string {
  return basename(dirname(file));
}

function createReexports(
  root: string,
  imports: SubpathImports,
  directory: Directory,
): string {
  const modules = globSync("*.ts", {
    cwd: resolvePath(root, directory),
  }).sort();

  const reexports = map(modules, (module) => {
    const specifier = resolveImportSpecifier(imports, `${directory}/${module}`);

    return `export * from "${specifier}";`;
  });

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
  const rootPath = resolvePath(root);

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
    update(content) {
      return syncBlocks(content, typescriptBlocks, (directory) => {
        return createReexports(rootPath, imports, directory);
      });
    },
  });
}
