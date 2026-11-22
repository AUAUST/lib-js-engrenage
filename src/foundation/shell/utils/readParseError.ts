import type { createSourceIndex, ParseError } from "sh-syntax/sync";

import { ShellSyntaxError } from "#foundation/shell/errors/ShellSyntaxError";
import { readColumn } from "#foundation/shell/utils/readColumn";

export function readParseError(
  source: string,
  { text, pos }: ParseError,
  indexSource: typeof createSourceIndex,
) {
  if (pos == null) {
    return new ShellSyntaxError(text, 0, 0);
  }

  const column = readColumn(source, indexSource(source)(pos.offset));

  return new ShellSyntaxError(text, pos.line, column);
}
