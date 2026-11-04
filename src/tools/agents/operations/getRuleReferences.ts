import { claudeRulesGlob } from "#tools/agents/claude/constants";
import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";
import type { File } from "#types/File";

export function getRuleReferences({
  filesystem,
}: ResolvedConfig): ReadonlyMap<string, readonly File[]> {
  const references = new Map<string, File[]>();

  for (const file of filesystem.glob(claudeRulesGlob)) {
    const content = filesystem.read(file) ?? "";

    for (const match of content.matchAll(/^<!-- @reference (\S+) -->\r?$/gm)) {
      const reference = match[1];

      if (reference !== undefined) {
        references.set(reference, [...(references.get(reference) ?? []), file]);
      }
    }
  }

  return references;
}
