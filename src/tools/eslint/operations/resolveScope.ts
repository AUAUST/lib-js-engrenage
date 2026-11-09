import { flatMap } from "@auaust/primitive-kit/arrays";
import { getOwn, values } from "@auaust/toolkit/object";

import { filesIn } from "#foundation/filesystem/index";
import { anyFile } from "#tools/eslint/constants";
import type { ContributedEnvironment } from "#project/environments/index";
import type { ScopeReference } from "#tools/eslint/types/ScopeReference";
import type { ScopeReferences } from "#tools/eslint/types/ScopeReferences";
import type { ScopeSources } from "#tools/eslint/types/ScopeSources";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

const filesPrefix = "files.";
const dirPrefix = "dir.";

function workspaceGlobs({ workspaces }: ScopeSources): Globs {
  return flatMap(workspaces, ({ globs }) => globs);
}

function listEnvironments({
  environments,
}: ScopeSources): ContributedEnvironment[] {
  return values(environments).filter((environment) => {
    return environment !== undefined;
  });
}

function shippedDirs(
  sources: ScopeSources,
  code: "published" | "private",
): Globs {
  return filesIn(
    flatMap(listEnvironments(sources), ({ entry, environment }) => {
      return entry.code === code ? environment.dirs : [];
    }),
    anyFile,
  );
}

function environmentOf(
  { environments }: ScopeSources,
  reference: ScopeReference,
  name: string,
): ContributedEnvironment {
  const environment = getOwn(environments, name);

  if (environment === undefined) {
    throw new Error(
      `The ESLint scope ${reference} names the ${name} environment, which no active extension contributes`,
    );
  }

  return environment;
}

function resolveScopeReference(
  sources: ScopeSources,
  reference: ScopeReference,
): Globs {
  const { tests, files } = sources;

  switch (reference) {
    case "files.code": {
      return [
        ...flatMap(listEnvironments(sources), ({ entry, environment }) => {
          return entry.level === "enforced" ? (environment.globs ?? []) : [];
        }),
        ...workspaceGlobs(sources),
      ];
    }

    case "files.discovered": {
      return files.discovered;
    }

    case "files.generated": {
      return files.generated;
    }

    case "files.test": {
      return tests.files;
    }

    case "files.test.public": {
      return [...tests.patterns.plain, ...tests.patterns.dist];
    }

    case "files.test.src": {
      return tests.patterns.source;
    }

    case "files.workspaces": {
      return workspaceGlobs(sources);
    }

    case "files.code.published": {
      return files.published;
    }

    case "files.code.private": {
      return files.private;
    }

    case "dir.published": {
      return shippedDirs(sources, "published");
    }

    case "dir.private": {
      return shippedDirs(sources, "private");
    }
  }

  if (reference.startsWith(filesPrefix)) {
    const name = reference.slice(filesPrefix.length);

    return environmentOf(sources, reference, name).environment.globs ?? [];
  }

  const name = reference.slice(dirPrefix.length);

  return filesIn(
    environmentOf(sources, reference, name).environment.dirs,
    anyFile,
  );
}

export function resolveScope(
  sources: ScopeSources,
  references: ScopeReferences,
): Glob[] {
  return flatMap(references, (reference) => {
    return resolveScopeReference(sources, reference);
  });
}
