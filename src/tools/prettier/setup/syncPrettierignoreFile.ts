import { flatMap, includes, map } from "@auaust/primitive-kit/arrays";

import {
  anchorGlob,
  settlePreset,
  syncIgnoreFile,
} from "#foundation/blocks/index";
import {
  createResourceIgnores,
  listLocationGlobs,
  type LoadedConfig,
} from "#project/config/index";
import {
  codegenTitle,
  defaultIgnores,
  prettierDefaultIgnores,
} from "#tools/prettier/constants";
import type { GlobGroup } from "#types/GlobGroup";

async function createProjectPrettierIgnores(
  config: LoadedConfig,
): Promise<readonly GlobGroup[]> {
  const [resources, files] = await Promise.all([
    config.resolve("resources"),
    config.resolve("files"),
  ]);

  const generatedResources = flatMap(
    resources.list({ generated: true }),
    ({ location }) => listLocationGlobs(location),
  );

  const codegen = map(
    files.generated.filter((glob) => !includes(generatedResources, glob)),
    anchorGlob,
  );

  return [
    ...createResourceIgnores(resources.list({ formatted: false }), {
      covered: prettierDefaultIgnores,
    }),
    ...(codegen.length === 0 ? [] : [{ title: codegenTitle, globs: codegen }]),
  ];
}

export async function syncPrettierignoreFile(config: LoadedConfig) {
  const [root, filesystem, resolve, resources, project] = await Promise.all([
    config.context.root,
    config.context.filesystem,
    config.context.path,
    config.resolve("resources"),
    settlePreset(createProjectPrettierIgnores(config)),
  ]);

  await syncIgnoreFile(
    {
      root,
      filesystem,
      resolve,
    },
    {
      path:
        resources.get("prettierignore") === undefined
          ? undefined
          : resources.path("prettierignore"),
      presets: {
        defaults: () => defaultIgnores,
        project,
      },
    },
  );
}
