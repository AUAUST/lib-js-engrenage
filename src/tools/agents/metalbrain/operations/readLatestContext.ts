import { scanTranscriptTail } from "#tools/agents/metalbrain/operations/scanTranscriptTail";
import { parseAssistantMessages } from "#tools/agents/metalbrain/utils/parseAssistantMessages";
import type { File } from "#types/File";

/**
 * Reads, from a transcript's tail, the context of the latest assistant message it
 * holds. At PreToolUse that is the issuing message once Claude Code has written
 * it, otherwise the message before it. Returns nothing for a missing transcript
 * or one holding no assistant message.
 */
export function readLatestContext(
  transcript: File,
): Promise<number | undefined> {
  return scanTranscriptTail(transcript, (text) => {
    return parseAssistantMessages(text).at(-1)?.message.context;
  });
}
