import {
  createSkillFileFiller,
  renderFragment,
  type FragmentConditions,
  type FragmentRenderer,
} from "#metalbrain/instructions/index";
import { createAgentFillers } from "#tools/agents/operations/createAgentFillers";
import { listActiveExtensions } from "#tools/agents/operations/listActiveExtensions";
import type { LoadedConfig } from "#project/config/index";

const renderers = new WeakMap<LoadedConfig, Promise<FragmentRenderer>>();

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
        body,
        source,
        conditions,
        skill === undefined
          ? fillers
          : {
              ...fillers,
              "skill-file": createSkillFileFiller(skill, {
                kind: "supporting",
                files: skill.files,
              }),
              "shared-file": createSkillFileFiller(skill, {
                kind: "shared",
                files: skill.shared,
                onFill: skill.onSharedFile,
              }),
            },
      );
    },
  };
}

/**
 * Creates the renderer of agent instruction fragments for a loaded config, holding
 * its contributed fillers and the built-in `@skill-file` and `@shared-file`
 * fillers, and filtering its `@extension` and `@file` blocks.
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
