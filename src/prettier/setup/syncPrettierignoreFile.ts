import { map } from "@auaust/primitive-kit/arrays";

import { changesetsCli } from "#constants";
import { createProjectIgnores } from "#git/utils/createProjectIgnores";
import {
  changelogIgnores,
  codegenTitle,
  defaultIgnores,
} from "#prettier/constants";
import { syncIgnoreFile } from "#utils/syncIgnoreFile";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Glob } from "#types/Glob";
import type { GlobGroup } from "#types/GlobGroup";

function anchor(glob: Glob): Glob {
  return glob.startsWith("!") ? `!/${glob.slice(1)}` : `/${glob}`;
}

function createProjectPrettierIgnores(
  config: ResolvedConfig,
): ReadonlyArray<GlobGroup> {
  const { generated } = config.files;

  return [
    ...createProjectIgnores(config),
    ...(config.environment.hasDependency(changesetsCli)
      ? [changelogIgnores]
      : []),
    ...(generated.length === 0
      ? []
      : [
          {
            title: codegenTitle,
            globs: map(generated, anchor),
          },
        ]),
  ];
}

export function syncPrettierignoreFile(config: ResolvedConfig) {
  syncIgnoreFile(config, {
    path: config.prettierignorePath,
    presets: {
      defaults: () => defaultIgnores,
      project: () => createProjectPrettierIgnores(config),
    },
  });
}
