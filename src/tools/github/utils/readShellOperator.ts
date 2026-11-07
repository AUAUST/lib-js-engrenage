import type { ParseEntry as Token } from "shell-quote";

import { isString } from "@auaust/toolkit/isString";

import type { ShellWord as Word } from "#tools/github/types/ShellWord";

export function readShellOperator(
  token: Token | Word | undefined,
): string | undefined {
  return token === undefined || isString(token) || !("op" in token)
    ? undefined
    : token.op;
}
