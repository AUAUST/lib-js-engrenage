import { includes, map } from "@auaust/primitive-kit/arrays";

import { changesetsCli } from "#constants";
import { settlePreset, syncIgnoreFile } from "#foundation/blocks/index";
import {
  environmentSection,
  filesSection,
  type LoadedConfig,
} from "#project/config/index";
import { agentsSection, codexFile } from "#tools/agents/index";
import { createProjectIgnores } from "#tools/git/index";
import { prettierSection } from "#tools/prettier/config/prettierSection";
import {
  changelogIgnores,
  codegenTitle,
  defaultIgnores,
} from "#tools/prettier/constants";
import type { Glob } from "#types/Glob";
import type { GlobGroup } from "#types/GlobGroup";

function anchor(glob: Glob): Glob {
  return glob.startsWith("!") ? `!/${glob.slice(1)}` : `/${glob}`;
}

async function createProjectPrettierIgnores(
  config: LoadedConfig,
): Promise<readonly GlobGroup[]> {
  const files = await config.resolve(filesSection);
  const agents = await config.resolve(agentsSection);

  const generated = [
    ...map(files.generated, anchor),
    ...(includes(agents.preferred ?? [], "codex") ? [`/${codexFile}`] : []),
  ];

  const environment = await config.resolve(environmentSection);

  return [
    ...(await createProjectIgnores(config)),
    ...(environment.hasDependency(changesetsCli) ? [changelogIgnores] : []),
    ...(generated.length === 0
      ? []
      : [
          {
            title: codegenTitle,
            globs: generated,
          },
        ]),
  ];
}

export async function syncPrettierignoreFile(config: LoadedConfig) {
  const [root, filesystem, resolve, prettier, project] = await Promise.all([
    config.context.root,
    config.context.filesystem,
    config.context.path,
    config.resolve(prettierSection),
    settlePreset(createProjectPrettierIgnores(config)),
  ]);

  await syncIgnoreFile(
    {
      root,
      filesystem,
      resolve,
    },
    {
      path: await prettier.prettierignore,
      presets: {
        defaults: () => defaultIgnores,
        project,
      },
    },
  );
}
