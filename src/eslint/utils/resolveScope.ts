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
  const { code, test } = config;

  const roles = {
    source: config.source.dirs,
    bin: config.bin.dirs,
    scripts: config.scripts.dirs,
    tests: test.dirs,
    published: [...config.source.dirs, ...config.bin.dirs],
    private: [...test.dirs, ...config.scripts.dirs],
  };

  switch (reference) {
    case "files.code": {
      return code.files;
    }

    case "files.config": {
      return code.configFiles;
    }

    case "files.discovered": {
      return code.discoveredFiles;
    }

    case "files.generated": {
      return code.generatedFiles;
    }

    case "files.test": {
      return test.files;
    }

    case "files.source": {
      return filesIn(roles.source, code.files);
    }

    case "files.bin": {
      return filesIn(roles.bin, code.files);
    }

    case "files.scripts": {
      return filesIn(roles.scripts, code.files);
    }

    case "files.tests": {
      return filesIn(roles.tests, code.files);
    }

    case "files.code.published": {
      return filesIn(roles.published, code.files);
    }

    case "files.code.private": {
      return filesIn(roles.private, code.files);
    }

    case "dir.source": {
      return filesIn(roles.source, anyFile);
    }

    case "dir.bin": {
      return filesIn(roles.bin, anyFile);
    }

    case "dir.scripts": {
      return filesIn(roles.scripts, anyFile);
    }

    case "dir.tests": {
      return filesIn(roles.tests, anyFile);
    }

    case "dir.published": {
      return filesIn(roles.published, anyFile);
    }

    case "dir.private": {
      return filesIn(roles.private, anyFile);
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
