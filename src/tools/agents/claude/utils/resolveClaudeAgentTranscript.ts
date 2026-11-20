import { dirname, join } from "node:path";

import type { File } from "#types/File";

export function resolveClaudeAgentTranscript(run: {
  session: string;
  agent: string;
  transcript: File;
}): File {
  return join(
    dirname(run.transcript),
    run.session,
    "subagents",
    `agent-${run.agent}.jsonl`,
  );
}
