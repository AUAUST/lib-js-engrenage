import { join } from "node:path";

import { entries } from "@auaust/toolkit/object";

import { readManifestRepository } from "#tools/github/issues/api/operations/readManifestRepository";
import { resolveCurrentRepository } from "#tools/github/issues/api/operations/resolveCurrentRepository";
import type { Directory } from "#types/Directory";
import type { PackageName } from "#types/PackageName";
import type { PackageNames } from "#types/PackageNames";

function splitPackageName(name: PackageName) {
  const [
    scope,
    unscoped,
  ] = name.startsWith("@") ? name.split("/", 2) : [undefined, name];

  return { scope, unscoped: unscoped ?? name };
}

export async function resolveRegisteredRepositories({
  root,
  name,
  dependencies,
  configured,
}: {
  root: Directory;
  name: PackageName | undefined;
  dependencies: PackageNames | undefined;
  configured: Readonly<Record<string, string | false>>;
}): Promise<ReadonlyMap<string, string>> {
  const repositories = new Map<string, string>();

  if (name !== undefined) {
    const current = await resolveCurrentRepository(root);

    if (current !== undefined) {
      repositories.set(splitPackageName(name).unscoped, current);
    }

    const { scope } = splitPackageName(name);

    const siblings = scope === undefined
      ? []
      : (dependencies ?? []).filter((dependency) => {
          return splitPackageName(dependency).scope === scope;
        });

    const resolved = await Promise.all(
      siblings.map(async (dependency) => {
        return [
          splitPackageName(dependency).unscoped,
          await readManifestRepository(join(root, "node_modules", dependency)),
        ] as const;
      }),
    );

    for (const [short, repository] of resolved) {
      if (repository !== undefined) {
        repositories.set(short, repository);
      }
    }
  }

  for (const [short, repository] of entries(configured)) {
    if (repository === false) {
      repositories.delete(short);
    } else {
      repositories.set(short, repository);
    }
  }

  return repositories;
}
