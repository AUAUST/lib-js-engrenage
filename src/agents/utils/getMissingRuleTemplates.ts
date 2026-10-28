import { getRuleTemplates } from "#agents/utils/getRuleTemplates";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";

export function getMissingRuleTemplates({ filesystem }: ResolvedConfig) {
  const references = new Set<string>();

  for (const file of filesystem.glob(".claude/rules/**/*.md")) {
    const content = filesystem.read(file) ?? "";

    for (const match of content.matchAll(/^<!-- @reference (\S+) -->\r?$/gm)) {
      if (match[1] !== undefined) {
        references.add(match[1]);
      }
    }
  }

  return getRuleTemplates().filter(({ file, reference }) => {
    return !filesystem.exists(file) && !references.has(reference);
  });
}
