import { flatMap, includes, map } from "@auaust/toolkit/array";

import { anchorGlob, settlePreset } from "#foundation/blocks/index";
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
import type { IgnorePresets } from "#types/IgnorePresets";

async function createProjectPrettierIgnores(
  config: LoadedConfig,
): Promise<readonly GlobGroup[]> {
  const [
    resources,
    files,
  ] = await Promise.all([config.resolve("resources"), config.resolve("files")]);

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

/**
 * The presets of `.prettierignore`'s `@ignore` blocks: `defaults` with Prettier's
 * usual ignores, `project` with unformatted resources and generated files.
 */
export async function createPrettierignorePresets(
  config: LoadedConfig,
): Promise<IgnorePresets> {
  const project = await settlePreset(createProjectPrettierIgnores(config));

  return {
    defaults: () => defaultIgnores,
    project,
  };
}
