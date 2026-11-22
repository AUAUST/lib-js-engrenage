import { basename, dirname, join } from "node:path";

import type { ToolPayload } from "#metalbrain/runtimes/types/ToolPayload";
import type { File } from "#types/File";

/**
 * The transcript of the agent issuing a tool call: the session's own, or its
 * subagent's beside it.
 */
export function resolveTranscript({
  transcript,
  agent,
}: Pick<ToolPayload, "transcript" | "agent">): File {
  return agent === undefined
    ? transcript
    : join(
        dirname(transcript),
        basename(transcript, ".jsonl"),
        "subagents",
        `agent-${agent}.jsonl`,
      );
}
