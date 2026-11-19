import { syncBlocks } from "#foundation/blocks/index";
import { markdownBlocks } from "#tools/agents/constants";
import { filterConditionalBlocks } from "#tools/agents/utils/filterConditionalBlocks";
import type { FragmentConditions } from "#tools/agents/types/FragmentConditions";
import type { BlockFillers } from "#types/BlockFillers";
import type { File } from "#types/File";

/**
 * Renders an instruction fragment: keeps the conditional blocks whose
 * condition holds, then fills its blocks and drops their markers, prefixing
 * any error with `source`.
 */
export async function renderFragment(
  body: string,
  source: File,
  conditions: FragmentConditions,
  fillers: BlockFillers,
): Promise<string> {
  try {
    const kept = await filterConditionalBlocks(body, conditions);

    return await syncBlocks(kept, markdownBlocks, fillers, {
      markers: "drop",
    });
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }

    throw new Error(`${source}: ${error.message}`, { cause: error });
  }
}
