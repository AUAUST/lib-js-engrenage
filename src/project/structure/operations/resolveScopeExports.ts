import { posix } from "node:path";

import { entries, freeze, record, values } from "@auaust/toolkit/object";

import { rootScope } from "#batiment/scopes/constants";
import type { Scope } from "#batiment/scopes/index";
import type { ConfigResolver } from "#project/config/index";
import type { Directory } from "#types/Directory";

const sourceNamespace = "src";

function isExposed({ namespaces }: Scope): boolean {
  return namespaces.some(({ name, kind }) => {
    return name === sourceNamespace && (kind.inward ?? "sealed") !== "sealed";
  });
}

/**
 * The `exports` map of each unpublished scope a workspace declares as a
 * dependency, by scope directory: the package entries its `src` exposes, as a
 * published scope's build exports them, each at its source file; none when its
 * `src` namespace is sealed.
 */
export async function resolveScopeExports(
  config: ConfigResolver,
): Promise<ReadonlyMap<Directory, Readonly<Record<string, string>>>> {
  const [groups, traits, tree] = await Promise.all([
    config.resolve("workspaces"),
    config.resolve("traits"),
    config.resolve("scopes"),
  ]);

  const imported = new Set(
    groups.flatMap(({ workspaces }) => {
      return workspaces.flatMap(({ dependencies }) => dependencies);
    }),
  );

  const scopes = values(tree.scopes).filter(({ dir }) => {
    return imported.has(dir) && !(dir === rootScope && traits.published);
  });

  const resolved = await Promise.all(
    scopes.map(async (scope) => {
      const scoped = await config.context.scope(scope.dir);

      const exposed = isExposed(scope)
        ? await scoped.resolve("src.exports")
        : undefined;

      const exports = entries(exposed ?? {})
        .map(([subpath, file]) => {
          return [subpath, `./${posix.relative(scope.dir, file)}`] as const;
        })
        .toSorted(([first], [second]) => first.localeCompare(second));

      return [scope.dir, freeze(record(exports))] as const;
    }),
  );

  return new Map(resolved);
}
