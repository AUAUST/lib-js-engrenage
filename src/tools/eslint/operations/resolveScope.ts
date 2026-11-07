import { flatMap } from "@auaust/primitive-kit/arrays";

import { filesIn } from "#foundation/filesystem/index";
import { anyFile } from "#tools/eslint/constants";
import type { ScopeReference } from "#tools/eslint/types/ScopeReference";
import type { ScopeReferences } from "#tools/eslint/types/ScopeReferences";
import type { ScopeSources } from "#tools/eslint/types/ScopeSources";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

function workspaceGlobs({ workspaces }: ScopeSources): Globs {
  return flatMap(workspaces, ({ globs }) => globs);
}

function resolveScopeReference(
  sources: ScopeSources,
  reference: ScopeReference,
): Globs {
  const { src, bin, scripts, tests, tooling, files } = sources;

  switch (reference) {
    case "files.code": {
      return [
        ...src.globs,
        ...bin.globs,
        ...scripts.globs,
        ...tests.globs,
        ...tooling.globs,
        ...workspaceGlobs(sources),
      ];
    }

    case "files.tooling": {
      return tooling.globs;
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

    case "files.src": {
      return src.globs;
    }

    case "files.bin": {
      return bin.globs;
    }

    case "files.scripts": {
      return scripts.globs;
    }

    case "files.tests": {
      return tests.globs;
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

    case "dir.src": {
      return filesIn(src.dirs, anyFile);
    }

    case "dir.bin": {
      return filesIn(bin.dirs, anyFile);
    }

    case "dir.scripts": {
      return filesIn(scripts.dirs, anyFile);
    }

    case "dir.tests": {
      return filesIn(tests.dirs, anyFile);
    }

    case "dir.published": {
      return filesIn([...src.dirs, ...bin.dirs], anyFile);
    }

    case "dir.private": {
      return filesIn([...tests.dirs, ...scripts.dirs], anyFile);
    }
  }
}

export function resolveScope(
  sources: ScopeSources,
  references: ScopeReferences,
): Glob[] {
  return flatMap(references, (reference) => {
    return resolveScopeReference(sources, reference);
  });
}
