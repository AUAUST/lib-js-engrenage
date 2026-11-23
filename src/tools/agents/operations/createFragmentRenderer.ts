import {
  createSkillFileFiller,
  createWordCapsFiller,
  renderFragment,
  type FragmentConditions,
  type FragmentRenderer,
} from "#metalbrain/instructions/index";
import { createAgentFillers } from "#tools/agents/operations/createAgentFillers";
import { getSkillDefinitions } from "#tools/agents/operations/getSkillDefinitions";
import { listActiveExtensions } from "#tools/agents/operations/listActiveExtensions";
import { renderAgentLimits } from "#tools/agents/utils/renderAgentLimits";
import type { MetalbrainFacts } from "#metalbrain/facts/index";
import type { LoadedConfig } from "#project/config/index";
import type { BlockFillers } from "#types/BlockFillers";

const renderers = new WeakMap<LoadedConfig, Promise<FragmentRenderer>>();

// @debt `@agent-limits` reads skill definitions through the active extensions instead of the manifest's fragment sources, until the template operations take them
function createAgentLimitsFiller(config: LoadedConfig): BlockFillers[string] {
  let definitions: ReturnType<typeof getSkillDefinitions> | undefined;

  return async (...names) => {
    definitions ??= getSkillDefinitions({
      extensions: await listActiveExtensions(config),
    });

    const all = await definitions;

    return renderAgentLimits(
      names.length === 0
        ? all
        : names.flatMap((name) => {
            return all.filter(({ agent }) => agent?.name === name);
          }),
    );
  };
}

async function buildRenderer(
  config: LoadedConfig,
  facts: MetalbrainFacts,
): Promise<FragmentRenderer> {
  const contributed = await createAgentFillers(config);

  const fillers: BlockFillers = {
    ...contributed,
    "word-caps": createWordCapsFiller(facts.wordCaps),
    "agent-limits": createAgentLimitsFiller(config),
  };

  const conditions: FragmentConditions = {
    extensions: facts.fragments.extensions,
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
 * Creates the renderer of agent instruction fragments for a loaded config and
 * its manifest, holding its contributed fillers and the built-in `@word-caps`,
 * `@agent-limits`, `@skill-file` and `@shared-file` fillers, and filtering its
 * `@extension` and `@file` blocks.
 */
export function createFragmentRenderer(
  config: LoadedConfig,
  facts: MetalbrainFacts,
): Promise<FragmentRenderer> {
  let renderer = renderers.get(config);

  if (renderer === undefined) {
    renderer = buildRenderer(config, facts);

    renderers.set(config, renderer);
  }

  return renderer;
}
