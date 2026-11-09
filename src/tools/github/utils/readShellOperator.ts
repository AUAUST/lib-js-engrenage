import { isString } from "@auaust/toolkit/isString";

import type { ShellToken as Token } from "#tools/github/types/ShellToken";
import type { ShellWord as Word } from "#tools/github/types/ShellWord";

export function readShellOperator(
  token: Token | Word | undefined,
): string | undefined {
  return token === undefined || isString(token) || !("op" in token)
    ? undefined
    : token.op;
}
