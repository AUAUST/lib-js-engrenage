import { createAgentFillers } from "#tools/agents/operations/createAgentFillers";
import { createSkillFileFiller } from "#tools/agents/utils/createSkillFileFiller";
import { renderFragment } from "#tools/agents/utils/renderFragment";
import type { LoadedConfig } from "#project/config/index";
import type { FragmentRenderer } from "#tools/agents/types/FragmentRenderer";

const renderers = new WeakMap<LoadedConfig, Promise<FragmentRenderer>>();

async function buildRenderer(config: LoadedConfig): Promise<FragmentRenderer> {
  const fillers = await createAgentFillers(config);

  return {
    render(body, source, skill) {
      return renderFragment(
        body,
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
 * holding its contributed fillers and the built-in `@skill-file` filler.
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
