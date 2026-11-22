import { ShellSyntaxError } from "#foundation/shell/errors/ShellSyntaxError";

// @debt reads the position and feature from sh-syntax's message text (`1:6: … are a zsh feature; tried parsing as bash`), since its language errors carry no `pos`
export function readDialectError(source: string, message: string) {
  const match = /^(\d+):(\d+): (.+?)(?:; tried parsing as \w+)?$/su.exec(
    message,
  );

  const text = `${match?.[3] ?? message}: write POSIX sh`;

  if (match?.[1] === undefined || match[2] === undefined) {
    return new ShellSyntaxError(text, 0, 0);
  }

  const line = Number(match[1]);
  const lineText = source.split("\n")[line - 1] ?? "";

  const column = (
    Buffer.from(lineText)
      .subarray(0, Number(match[2]) - 1)
      .toString().length + 1
  );

  return new ShellSyntaxError(text, line, column);
}
