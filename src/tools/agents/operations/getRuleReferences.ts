import { claudeRulesGlob } from "#tools/agents/claude/constants";
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

    for (const match of content.matchAll(/^<!-- @reference (\S+) -->\r?$/gm)) {
      const reference = match[1];

      if (reference !== undefined) {
        references.set(reference, [...(references.get(reference) ?? []), file]);
      }
    }
  }

  return references;
}
