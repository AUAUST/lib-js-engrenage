import { includes, map } from "@auaust/primitive-kit/arrays";

import { changesetsCli } from "#constants";
import { settlePreset, syncIgnoreFile } from "#foundation/blocks/index";
import { codexFile, type ResolvedAgents } from "#tools/agents/index";
import { createProjectIgnores } from "#tools/git/index";
import {
  changelogIgnores,
  codegenTitle,
  defaultIgnores,
} from "#tools/prettier/constants";
import type { OptionContext } from "#foundation/options/index";
import type { ProjectConfig } from "#project/config/index";
import type { ResolvedPrettier } from "#tools/prettier/types/ResolvedPrettier";
import type { Glob } from "#types/Glob";
import type { GlobGroup } from "#types/GlobGroup";

function anchor(glob: Glob): Glob {
  return glob.startsWith("!") ? `!/${glob.slice(1)}` : `/${glob}`;
}

async function createProjectPrettierIgnores(
  config: OptionContext<ProjectConfig & { agents: ResolvedAgents }>,
): Promise<readonly GlobGroup[]> {
  const files = await config.get("files");
  const agents = await config.get("agents");

  const generated = [
    ...map(files.generated, anchor),
    ...(includes(agents.preferred ?? [], "codex") ? [`/${codexFile}`] : []),
  ];

  const environment = await config.get("environment");

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

export async function syncPrettierignoreFile(
  config: OptionContext<
    ProjectConfig & {
      agents: ResolvedAgents;
      prettier: ResolvedPrettier;
    }
  >,
) {
  const [root, filesystem, resolve, prettier, project] = await Promise.all([
    config.get("root"),
    config.get("filesystem"),
    config.get("resolve"),
    config.get("prettier"),
    settlePreset(createProjectPrettierIgnores(config)),
  ]);

  syncIgnoreFile(
    {
      root,
      filesystem,
      resolve,
    },
    {
      path: prettier.prettierignore,
      presets: {
        defaults: () => defaultIgnores,
        project,
      },
    },
  );
}
