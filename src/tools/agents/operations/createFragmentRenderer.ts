import { createAgentFillers } from "#tools/agents/operations/createAgentFillers";
import { listActiveExtensions } from "#tools/agents/operations/listActiveExtensions";
import { createSkillFileFiller } from "#tools/agents/utils/createSkillFileFiller";
import { filterConditionalBlocks } from "#tools/agents/utils/filterConditionalBlocks";
import { renderFragment } from "#tools/agents/utils/renderFragment";
import type { LoadedConfig } from "#project/config/index";
import type { FragmentConditions } from "#tools/agents/types/FragmentConditions";
import type { FragmentRenderer } from "#tools/agents/types/FragmentRenderer";
import type { File } from "#types/File";

const renderers = new WeakMap<LoadedConfig, Promise<FragmentRenderer>>();

async function filterBlocks(
  body: string,
  source: File,
  conditions: FragmentConditions,
) {
  try {
    return await filterConditionalBlocks(body, conditions);
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }

    throw new Error(`${source}: ${error.message}`, { cause: error });
  }
}

async function buildRenderer(config: LoadedConfig): Promise<FragmentRenderer> {
  const fillers = await createAgentFillers(config);

  const active = await listActiveExtensions(config);

  const conditions: FragmentConditions = {
    extensions: new Set(active.map(({ name }) => name)),
    exists: (file) => config.context.filesystem.exists(file),
  };

  return {
    async render(body, source, skill) {
      return renderFragment(
        await filterBlocks(body, source, conditions),
        source,
        skill === undefined
          ? fillers
          : { ...fillers, "skill-file": createSkillFileFiller(skill) },
      );
    },
  };
}

/**
 * Creates the renderer of agent instruction fragments for a loaded config,
 * holding its contributed fillers and the built-in `@skill-file` filler, and
 * filtering its `@extension` and `@file` blocks.
 */
export function createFragmentRenderer(
  config: LoadedConfig,
): Promise<FragmentRenderer> {
  let renderer = renderers.get(config);

  if (renderer === undefined) {
    renderer = buildRenderer(config);

    renderers.set(config, renderer);
  }

  return renderer;
}
