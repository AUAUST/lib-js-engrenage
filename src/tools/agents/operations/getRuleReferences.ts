import { listBlockMarkers } from "#foundation/blocks/index";
import { claudeRulesGlob } from "#tools/agents/claude/constants";
import { markdownBlocks } from "#tools/agents/constants";
import type { Filesystem } from "#foundation/filesystem/index";
import type { File } from "#types/File";

export async function getRuleReferences({
  filesystem,
}: {
  filesystem: Filesystem;
}): Promise<ReadonlyMap<string, readonly File[]>> {
  const references = new Map<string, File[]>();

  for (const file of await filesystem.glob(claudeRulesGlob)) {
    const content = (await filesystem.read(file)) ?? "";

    const markers = listBlockMarkers(content, markdownBlocks).filter(
      ({ directive }) => directive === "reference",
    );

    for (const {
      args: [reference],
    } of markers) {
      if (reference !== undefined) {
        references.set(reference, [...(references.get(reference) ?? []), file]);
      }
    }
  }

  return references;
}
