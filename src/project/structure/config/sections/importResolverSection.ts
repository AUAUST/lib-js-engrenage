import { statSync } from "node:fs";
import { posix } from "node:path";

import { isArray, isPlainObject, isString } from "@auaust/toolkit";
import { entries, record } from "@auaust/toolkit/object";

import { rootScope } from "#batiment/scopes/constants";
import { packageJsonFile } from "#constants";
import { resolve } from "#foundation/filesystem/index";
import { declareSection } from "#foundation/options/index";
import { readSelectedLanguages } from "#project/environments/index";
import {
  createPackageJson,
  type PackageJson,
  type SubpathImports,
} from "#project/package/index";
import { createImportResolver } from "#project/structure/utils/createImportResolver";
import { listModuleExtensions } from "#project/structure/utils/listModuleExtensions";
import type { Alias, ResolvedAliases } from "#batiment/structure/index";
import type { ConfigResolver } from "#project/config/index";
import type { ScopeImports } from "#project/structure/types/ScopeImports";

const sourceConditions: ReadonlySet<string> = new Set([
  "types",
  "import",
  "default",
]);

function selectTarget(target: unknown): string | undefined {
  if (isString(target)) {
    return target;
  }

  if (isArray(target)) {
    for (const candidate of target) {
      const selected = selectTarget(candidate);

      if (selected !== undefined) {
        return selected;
      }
    }

    return;
  }

  if (isPlainObject(target)) {
    for (const [condition, candidate] of entries(target)) {
      const selected = sourceConditions.has(condition)
        ? selectTarget(candidate)
        : undefined;

      if (selected !== undefined) {
        return selected;
      }
    }
  }
}

// @debt drops a key whose target is `null`, so a specifier Node blocks still resolves through a broader pattern, and the resolver takes the first matching key instead of Node's most specific one
function listDeclaredAliases(
  imports: SubpathImports | undefined,
  generated: ResolvedAliases,
): Alias[] {
  const known = new Set(
    [...generated.global, ...generated.src].map(({ key }) => key),
  );

  return entries(imports ?? {}).flatMap(([key, target]): Alias[] => {
    const selected = known.has(key) ? undefined : selectTarget(target);

    return selected === undefined
      ? []
      : [
          {
            key,
            target: selected,
            source: `${packageJsonFile} imports`,
          },
        ];
  });
}

// @debt reads the `exports` sync last wrote rather than the map the config resolves, so lint judges an unpublished scope against a stale map until the next sync
function listExportedSubpaths(
  exports: PackageJson["exports"] | undefined,
): Readonly<Record<string, boolean>> | undefined {
  if (exports === undefined) {
    return;
  }

  const subpaths = isString(exports) || isArray(exports)
    ? []
    : entries(exports).filter(([key]) => key.startsWith("."));

  return subpaths.length === 0
    ? { ".": true }
    : record(
        subpaths.map(([key, target]) => {
          return [key, target !== null] as const;
        }),
      );
}

// @debt reads a workspace's package.json outside the live packageJson key, so a renamed workspace package keeps its old name and imports in a long-lived resolver
async function readWorkspacePackageJson(
  config: ConfigResolver,
  dir: string,
): Promise<PackageJson> {
  const path = posix.join(dir, packageJsonFile);

  return createPackageJson({
    root: config.context.root,
    path,
    content: await config.context.filesystem.read(path),
  });
}

export const importResolverSection = declareSection({
  async resolve(
    _input,
    config: ConfigResolver,
  ): Promise<ReturnType<typeof createImportResolver>> {
    const [scopes, rootPackageJson, languages] = await Promise.all([
      config.resolve("aliases.scopes"),
      config.resolve("packageJson"),
      readSelectedLanguages(config),
    ]);

    const { root } = config.context;

    const imports = await Promise.all(
      entries(scopes).map(async ([dir, aliases]) => {
        const packageJson = dir === rootScope
          ? rootPackageJson
          : await readWorkspacePackageJson(config, dir);

        const { name, imports: declared, exports } = packageJson.optional;

        return [
          dir,
          {
            aliases: [
              ...aliases.global,
              ...aliases.src,
              ...listDeclaredAliases(declared, aliases),
            ],
            packageName: name,
            exports: listExportedSubpaths(exports),
          } satisfies ScopeImports,
        ] as const;
      }),
    );

    return createImportResolver({
      root,
      scopes: record(imports),
      // @debt lists the module extensions of every environment, so a `.tsx` file resolves from an environment whose languages exclude tsx
      extensions: listModuleExtensions(languages),
      // @debt probes the disk rather than the project filesystem, which reads asynchronously, so a staged file no write has flushed resolves to no module
      isFile(file) {
        return (
          statSync(resolve(root, file), { throwIfNoEntry: false })?.isFile() ===
          true
        );
      },
    });
  },
});
