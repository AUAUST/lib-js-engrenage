import { posix, resolve } from "node:path";

import { flatMap, map } from "@auaust/toolkit/array";
import { entries, freeze, values } from "@auaust/toolkit/object";

import { rootScope } from "#batiment/scopes/constants";
import { relativeWithin, resolveWithin } from "#foundation/filesystem/index";
import { declareSection } from "#foundation/options/index";
import type { ConfigResolver } from "#project/config/types/ConfigResolver";
import type { Extension } from "#project/config/types/Extension";
import type { FileLocation } from "#project/config/types/FileLocation";
import type { FileResource } from "#project/config/types/FileResource";
import type { LocatedResource } from "#project/config/types/LocatedResource";
import type { ResolvedResources } from "#project/config/types/ResolvedResources";
import type { Directory } from "#types/Directory";
import type { Glob } from "#types/Glob";

type ResourceFlags = Pick<
  LocatedResource,
  "committed" | "generated" | "formatted" | "linted" | "appendOnly" | "diffed"
>;

interface ResourceFailure {
  readonly name: string;
  readonly error: Error;
  readonly flags: ResourceFlags;
}

interface ScopeResources {
  readonly dir: Directory;
  readonly located: readonly LocatedResource[];
  readonly failures: readonly ResourceFailure[];
}

export const resourcesSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ResolvedResources> {
    const { root, registry } = config.context;

    const { scopes } = await config.resolve("scopes");

    // @debt the reads of a workspace's child resolver escape the staleness tracking of this key, so a change only they observe leaves the resources stale
    const scoped = await Promise.all(
      map(values(scopes), async ({ dir }) => {
        return locateScope(
          dir === rootScope ? config : await config.context.scope(dir),
          dir,
          root,
        );
      }),
    );

    const paths = new Map<string, LocatedResource>();

    const located: LocatedResource[] = [];

    for (const resource of flatMap(scoped, (scope) => scope.located)) {
      const path = locationPath(resource.location);

      const other = path === undefined ? undefined : paths.get(path);

      if (other?.name === resource.name) {
        continue;
      }

      if (other !== undefined) {
        throw new Error(
          `File resources "${other.name}" of ${other.owner} and "${resource.name}" of ${resource.owner} are both located at ${path}`,
        );
      }

      if (path !== undefined) {
        paths.set(path, resource);
      }

      located.push(resource);
    }

    const resources = freeze(located);

    const failures = flatMap(scoped, (scope) => scope.failures);

    const rootResources = scoped.find(({ dir }) => dir === rootScope);

    function list(
      flags: Partial<ResourceFlags> = {},
    ): readonly LocatedResource[] {
      for (const failure of failures) {
        if (matches(failure.flags, flags)) {
          throw failure.error;
        }
      }

      return freeze(resources.filter((resource) => matches(resource, flags)));
    }

    function get(name: string): LocatedResource | undefined {
      if (registry.get("files", name) === undefined) {
        throw new Error(`Unknown file resource "${name}"`);
      }

      const failure = rootResources?.failures.find((failed) => {
        return failed.name === name;
      });

      if (failure !== undefined) {
        throw failure.error;
      }

      return rootResources?.located.find((resource) => {
        return resource.name === name;
      });
    }

    function path(name: string): string {
      const resource = get(name);

      if (resource === undefined) {
        throw new Error(`File resource "${name}" is absent from this project`);
      }

      const relative = locationPath(resource.location);

      if (relative === undefined) {
        throw new Error(`File resource "${name}" is located by globs`);
      }

      return resolveWithin(root, relative);
    }

    return freeze({
      list,
      get,
      path,
    });
  },
});

async function locateScope(
  config: ConfigResolver,
  dir: Directory,
  projectRoot: Directory,
): Promise<ScopeResources> {
  const located: LocatedResource[] = [];

  const failures: ResourceFailure[] = [];

  for (const { key: name, declaration, owner } of config.context.registry.list(
    "files",
  )) {
    const location = await locate(config, projectRoot, {
      name,
      owner,
      declaration,
    });

    if (location === undefined) {
      continue;
    }

    const committed = declaration.committed ?? true;
    const generated = declaration.generated ?? false;

    const flags: ResourceFlags = {
      committed,
      generated,
      formatted: declaration.formatted ?? (committed && !generated),
      linted: declaration.linted ?? true,
      appendOnly: declaration.appendOnly ?? false,
      diffed: declaration.diffed ?? true,
    };

    if (location instanceof Error) {
      failures.push({
        name,
        error: location,
        flags,
      });

      continue;
    }

    located.push(
      freeze({
        name,
        owner: owner.name,
        title: declaration.title ?? owner.title ?? owner.name,
        location,
        ...flags,
        parts: declaration.parts ?? false,
      }),
    );
  }

  return {
    dir,
    located,
    failures,
  };
}

function matches(
  subject: ResourceFlags,
  flags: Partial<ResourceFlags>,
): boolean {
  return entries(flags).every(([flag, value]) => {
    return value === undefined || subject[flag] === value;
  });
}

async function locate(
  config: ConfigResolver,
  projectRoot: Directory,
  {
    name,
    owner,
    declaration,
  }: { name: string; owner: Extension; declaration: FileResource },
): Promise<FileLocation | Error | undefined> {
  const { root, registry, scopeDir } = config.context;

  function relativize(path: string): string {
    return relativeWithin(projectRoot, resolve(root, path));
  }

  try {
    if (!(await registry.isActive(owner.name, config))) {
      return;
    }

    const location = await declaration.locate(config);

    if (location === undefined) {
      return;
    }

    if ("globs" in location) {
      return freeze({
        globs: map(location.globs, (glob) => prefixGlob(scopeDir, glob)),
      });
    }

    return "file" in location
      ? freeze({ file: relativize(location.file) })
      : freeze({ directory: relativize(location.directory) });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    const scope = scopeDir === rootScope ? "" : ` in ${scopeDir}`;

    return new Error(
      `File resource "${name}" of ${owner.name} cannot be located${scope}: ${message}`,
      { cause: error },
    );
  }
}

function prefixGlob(dir: Directory, glob: Glob): Glob {
  return glob.startsWith("!")
    ? `!${posix.join(dir, glob.slice(1))}`
    : posix.join(dir, glob);
}

function locationPath(location: FileLocation): string | undefined {
  return "globs" in location
    ? undefined
    : "file" in location
      ? location.file
      : location.directory;
}
