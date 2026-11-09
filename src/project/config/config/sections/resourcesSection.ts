import { freeze } from "@auaust/toolkit/object";

import { relativeWithin, resolveWithin } from "#foundation/filesystem/index";
import { declareSection } from "#foundation/options/index";
import type { ConfigResolver } from "#project/config/types/ConfigResolver";
import type { Extension } from "#project/config/types/Extension";
import type { FileLocation } from "#project/config/types/FileLocation";
import type { FileResource } from "#project/config/types/FileResource";
import type { LocatedResource } from "#project/config/types/LocatedResource";
import type { ResolvedResources } from "#project/config/types/ResolvedResources";

export const resourcesSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ResolvedResources> {
    const { root, registry } = config.context;

    const located = new Map<string, LocatedResource>();
    const failures = new Map<string, Error>();
    const paths = new Map<string, LocatedResource>();

    for (const { key: name, declaration, owner } of registry.list("files")) {
      if (!(await registry.isActive(owner.name))) {
        continue;
      }

      const location = await locate(config, name, owner, declaration);

      if (location === undefined) {
        continue;
      }

      if (location instanceof Error) {
        failures.set(name, location);

        continue;
      }

      const committed = declaration.committed ?? true;
      const generated = declaration.generated ?? false;

      const resource: LocatedResource = freeze({
        name,
        owner: owner.name,
        title: declaration.title ?? owner.title ?? owner.name,
        location,
        committed,
        generated,
        formatted: declaration.formatted ?? (committed && !generated),
        parts: declaration.parts ?? false,
      });

      const path = locationPath(location);

      if (path !== undefined) {
        const other = paths.get(path);

        if (other !== undefined) {
          throw new Error(
            `File resources "${other.name}" of ${other.owner} and "${name}" of ${owner.name} are both located at ${path}`,
          );
        }

        paths.set(path, resource);
      }

      located.set(name, resource);
    }

    const resources = freeze([...located.values()]);

    const [firstFailure] = failures.values();

    function list(): readonly LocatedResource[] {
      if (firstFailure !== undefined) {
        throw firstFailure;
      }

      return resources;
    }

    function get(name: string): LocatedResource | undefined {
      if (registry.get("files", name) === undefined) {
        throw new Error(`Unknown file resource "${name}"`);
      }

      const failure = failures.get(name);

      if (failure !== undefined) {
        throw failure;
      }

      return located.get(name);
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

async function locate(
  config: ConfigResolver,
  name: string,
  owner: Extension,
  declaration: FileResource,
): Promise<FileLocation | Error | undefined> {
  const { root } = config.context;

  try {
    const location = await declaration.locate(config);

    if (location === undefined || "globs" in location) {
      return location;
    }

    return "file" in location
      ? freeze({ file: relativeWithin(root, location.file) })
      : freeze({ directory: relativeWithin(root, location.directory) });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return new Error(
      `File resource "${name}" of ${owner.name} cannot be located: ${message}`,
      { cause: error },
    );
  }
}

function locationPath(location: FileLocation): string | undefined {
  return "globs" in location
    ? undefined
    : "file" in location
      ? location.file
      : location.directory;
}
