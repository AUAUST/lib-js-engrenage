import { listCodeRanges } from "#foundation/markdown/index";
import { agentLogFiles } from "#metalbrain/records/constants";
import type { File } from "#types/File";

const relativeFile = /^[\w.-]+(?:\/[\w.-]+)+\.\w+$/u;

/**
 * The relative file paths `text` names in code spans, deduplicated in source
 * order, leaving out the agent logs, which are created on demand.
 */
export function listMentionedFiles(text: string): readonly File[] {
  const files = new Set<File>();

  for (const { kind, start, end } of listCodeRanges(text)) {
    if (kind !== "span") {
      continue;
    }

    const path = text
      .slice(start, end)
      .replaceAll(/^`+|`+$/gu, "")
      .trim();

    if (
      relativeFile.test(path) &&
      !agentLogFiles.some((file) => file === path)
    ) {
      files.add(path);
    }
  }

  return [...files];
}
