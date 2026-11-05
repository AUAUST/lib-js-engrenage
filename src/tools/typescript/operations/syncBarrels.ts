import { globSync } from "node:fs";
import { basename, dirname, extname } from "node:path";

import { flatMap, map, toSorted } from "@auaust/primitive-kit/arrays";

import { syncBlocks, syncFiles } from "#foundation/blocks/index";
import { filesIn, relativeWithin, resolve } from "#foundation/filesystem/index";
import {
  barrelFiles,
  declarationExtension,
  identifierPattern,
  typescriptBlocks,
} from "#tools/typescript/constants";
import { resolveImportSpecifier } from "#tools/typescript/utils/resolveImportSpecifier";
import type { OptionContext } from "#foundation/options/index";
import type { ProjectConfig } from "#project/config/index";
import type { SubpathImports } from "#project/package/index";
import type { BarrelMode } from "#tools/typescript/types/BarrelMode";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Files } from "#types/Files";
import type { Glob } from "#types/Glob";

const collator = new Intl.Collator("en-US", {
  numeric: true,
  sensitivity: "base",
});

function compareNaturally(left: string, right: string): number {
  return collator.compare(left, right);
}

function createExport(
  mode: BarrelMode,
  name: string,
  specifier: string,
): string {
  switch (mode) {
    case "default": {
      return `export { default as ${name} } from "${specifier}";`;
    }

    case "named": {
      return `export { ${name} } from "${specifier}";`;
    }

    case "all": {
      return `export * from "${specifier}";`;
    }
  }
}

function assertMode(mode: string | undefined, barrel: File): BarrelMode {
  switch (mode) {
    case "default":
    case "named":
    case "all": {
      return mode;
    }

    default: {
      throw new Error(
        `Expected a barrel mode (default, named or all) in ${barrel}, got "${mode ?? ""}"`,
      );
    }
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
      if (!identifierPattern.test(name)) {
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

export async function syncBarrels(
  config: OptionContext<ProjectConfig>,
  barrels: readonly string[] = [],
) {
  const [rootPath, { imports }, source, bin, scripts, filesystem, resolve] =
    await Promise.all([
      config.get("root"),
      config.get("packageJson"),
      config.get("src"),
      config.get("bin"),
      config.get("scripts"),
      config.get("filesystem"),
      config.get("resolve"),
    ]);

  const allFiles = filesystem.glob(
    filesIn([...source.dirs, ...bin.dirs, ...scripts.dirs], barrelFiles),
  );

  const files =
    barrels.length === 0
      ? allFiles
      : flatMap(barrels, (name) => {
          return selectBarrels(allFiles, name);
        });

  function update(content: string, barrel: File): string {
    return syncBlocks(content, typescriptBlocks, {
      barrel(glob, mode) {
        if (glob === undefined) {
          throw new Error(`Expected a glob in the barrel marker of ${barrel}`);
        }

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

  syncFiles(
    { filesystem, resolve },
    map(files, (file) => {
      return {
        file,
        update,
      };
    }),
  );
}
