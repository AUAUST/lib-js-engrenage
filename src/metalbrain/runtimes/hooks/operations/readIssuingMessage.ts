import { scanTranscriptTail } from "#metalbrain/runtimes/hooks/operations/scanTranscriptTail";
import { findIssuingMessage } from "#metalbrain/runtimes/hooks/utils/findIssuingMessage";
import type { AssistantMessage } from "#metalbrain/runtimes/types/AssistantMessage";
import type { File } from "#types/File";

/**
 * Reads, from a transcript's tail, the assistant message issuing a tool use and
 * the context it gained over the message before it. Reads a longer tail until
 * both show; the gain stays unknown past the largest tail. Returns nothing for
 * a missing transcript or a tool use the tail lacks, as at PreToolUse, before
 * Claude Code writes the issuing message.
 */
export function readIssuingMessage(
  transcript: File,
  toolUse: string,
): Promise<{ issuing: AssistantMessage; contextGain?: number } | undefined> {
  return scanTranscriptTail(transcript, (text, { whole, last }) => {
    const found = findIssuingMessage(text, toolUse);

    if (found === undefined) {
      return;
    }

    const { issuing, previous } = found;

    if (previous !== undefined) {
      return { issuing, contextGain: issuing.context - previous.context };
    }

    if (whole) {
      return { issuing, contextGain: issuing.context };
    }

    return last ? { issuing } : undefined;
  });
}
