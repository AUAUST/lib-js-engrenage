import {
  createSkillFileFiller,
  createWordCapsFiller,
  renderFragment,
  type FragmentConditions,
  type FragmentRenderer,
  type InstructionRegistry,
  type SkillRendering,
} from "#metalbrain/instructions/index";
import { getSkillDefinitions } from "#metalbrain/runtimes/operations/getSkillDefinitions";
import { renderAgentLimits } from "#metalbrain/runtimes/utils/renderAgentLimits";
import type { Filesystem } from "#foundation/filesystem/index";
import type { MetalbrainFacts } from "#metalbrain/facts/index";
import type { BlockFillers } from "#types/BlockFillers";
import type { File } from "#types/File";

function createAgentLimitsFiller(
  instructions: InstructionRegistry,
): BlockFillers[string] {
  let definitions: ReturnType<typeof getSkillDefinitions> | undefined;

  return async (...names) => {
    definitions ??= getSkillDefinitions({ instructions });

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
 * Creates the renderer of agent instruction fragments for a manifest, its
 * instruction registry and the host's contributed fillers, adding the built-in
 * `@word-caps`, `@agent-limits`, `@skill-file` and `@shared-file` fillers, and
 * filtering its `@extension` and `@file` blocks.
 */
export function createFragmentRenderer({
  facts,
  instructions,
  fillers: contributed,
  filesystem,
}: {
  facts: MetalbrainFacts;
  instructions: InstructionRegistry;
  fillers: BlockFillers;
  filesystem: Filesystem;
}): FragmentRenderer {
  const fillers: BlockFillers = {
    ...contributed,
    "word-caps": createWordCapsFiller(facts.wordCaps),
    "agent-limits": createAgentLimitsFiller(instructions),
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
