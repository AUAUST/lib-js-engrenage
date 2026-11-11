import { syncBlocks } from "#foundation/blocks/index";
import { markdownBlocks } from "#tools/agents/constants";
import type { BlockFillers } from "#types/BlockFillers";
import type { File } from "#types/File";

export async function renderFragment(
  body: string,
  source: File,
  fillers: BlockFillers,
): Promise<string> {
  try {
    return await syncBlocks(body, markdownBlocks, fillers, {
      markers: "drop",
    });
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }

    throw new Error(`${source}: ${error.message}`, { cause: error });
  }
}
