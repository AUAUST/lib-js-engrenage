import { flatMap } from "@auaust/primitive-kit/arrays";

import { anyFile } from "#eslint/constants";
import { filesIn } from "#utils/filesIn";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { ScopeReference } from "#eslint/types/ScopeReference";
import type { ScopeReferences } from "#eslint/types/ScopeReferences";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

function resolveScopeReference(
  config: ResolvedConfig,
  reference: ScopeReference,
): Globs {
  const { src, bin, scripts, tests, files } = config;

  switch (reference) {
    case "files.code": {
      return config.typescript.files;
    }

    case "files.tooling": {
      return config.tooling.globs;
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
  config: ResolvedConfig,
  references: ScopeReferences,
): Glob[] {
  return flatMap(references, (reference) => {
    return resolveScopeReference(config, reference);
  });
}
