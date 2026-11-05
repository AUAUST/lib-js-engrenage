import { normalize } from "node:path";

import type { TsdownPlugin } from "tsdown";

import { resolve } from "#foundation/filesystem/index";
import type { PathAliases } from "#project/tsconfig/index";
import type { Directory } from "#types/Directory";
import type { PackageName } from "#types/PackageName";

const declarationFile = /\.d\.[cm]?ts$/;

// @debt the package specifier is rebuilt from the tsdown entry name here; PathAlias should carry it so both stay in sync
function toSpecifier(packageName: PackageName, entryName: string): string {
  const subpath =
    entryName === "index" ? "" : entryName.replace(/\/index$/, "");

  return subpath === "" ? packageName : `${packageName}/${subpath}`;
}

export function createEntrySelfReferencesPlugins(
  name: string,
  packageName: PackageName,
  sourceEntries: PathAliases,
  root: Directory,
): TsdownPlugin[] {
  const entryNames = new Map<string, string>();

  for (const { name: entryName, path } of sourceEntries) {
    entryNames.set(
      normalize(resolve(root, path)),
      toSpecifier(packageName, entryName),
    );
  }

  return [
    {
      name,
      async resolveId(source, importer, options) {
        // @debt declarations stay bundled because rolldown-plugin-dts keeps externalized import() types verbatim; fix upstream so declarations self-reference too
        if (importer === undefined || declarationFile.test(importer)) {
          return null;
        }

        const resolved = await this.resolve(source, importer, {
          ...options,
          skipSelf: true,
        });

        if (resolved?.external !== false) {
          return null;
        }

        const path = normalize(resolved.id);
        const specifier = entryNames.get(path);

        if (specifier === undefined || path === normalize(importer)) {
          return null;
        }

        return { id: specifier, external: true };
      },
    },
  ];
}
