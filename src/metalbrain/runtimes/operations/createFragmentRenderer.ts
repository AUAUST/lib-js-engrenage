import {
  createSkillFileFiller,
  createWordCapsFiller,
  renderFragment,
  type FragmentConditions,
  type FragmentRenderer,
  type SkillRendering,
} from "#metalbrain/instructions/index";
import { getSkillDefinitions } from "#metalbrain/runtimes/operations/getSkillDefinitions";
import { renderAgentLimits } from "#metalbrain/runtimes/utils/renderAgentLimits";
import type { Filesystem } from "#foundation/filesystem/index";
import type { FragmentSources, MetalbrainFacts } from "#metalbrain/facts/index";
import type { BlockFillers } from "#types/BlockFillers";
import type { File } from "#types/File";

function createAgentLimitsFiller(
  fragments: FragmentSources,
): BlockFillers[string] {
  let definitions: ReturnType<typeof getSkillDefinitions> | undefined;

  return async (...names) => {
    definitions ??= getSkillDefinitions({ fragments });

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

/**
 * Creates the renderer of agent instruction fragments for a manifest and the
 * host's contributed fillers, adding the built-in `@word-caps`, `@agent-limits`,
 * `@skill-file` and `@shared-file` fillers, and filtering its `@extension`
 * and `@file` blocks.
 */
export function createFragmentRenderer({
  facts,
  fillers: contributed,
  filesystem,
}: {
  facts: MetalbrainFacts;
  fillers: BlockFillers;
  filesystem: Filesystem;
}): FragmentRenderer {
  const fillers: BlockFillers = {
    ...contributed,
    "word-caps": createWordCapsFiller(facts.wordCaps),
    "agent-limits": createAgentLimitsFiller(facts.fragments),
  };

  const conditions: FragmentConditions = {
    extensions: facts.fragments.extensions,
    exists: (file) => filesystem.exists(file),
  };

  async function render(body: string, source: File, skill?: SkillRendering) {
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
  }

  return { render };
}
