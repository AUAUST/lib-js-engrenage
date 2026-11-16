// @debt comment lines are recognized by `#` only, while `core.commentChar` lets a repository pick another character
export function readCommitSubject(message: string): string {
  const subject = message.split("\n").find((line) => {
    return line.trim() !== "" && !line.startsWith("#");
  });

  return subject?.trimEnd() ?? "";
}
