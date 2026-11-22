import type { CommitMessage } from "#tools/git/types/CommitMessage";

const scissors = "# ------------------------ >8 ------------------------";

// @debt comment lines are recognized by `#` only, while `core.commentChar` lets a repository pick another character
export function readCommitMessage(message: string): CommitMessage {
  const lines: string[] = [];

  for (const line of message.split("\n")) {
    if (line === scissors) {
      break;
    }

    if (!line.startsWith("#")) {
      lines.push(line.trimEnd());
    }
  }

  const start = lines.findIndex((line) => line !== "");

  if (start === -1) {
    return { subject: "", body: [] };
  }

  const rest = lines.slice(start + 1);

  const first = rest.findIndex((line) => line !== "");

  const last = rest.findLastIndex((line) => line !== "");

  return {
    subject: lines[start],
    body: first === -1 ? [] : rest.slice(first, last + 1),
  };
}
