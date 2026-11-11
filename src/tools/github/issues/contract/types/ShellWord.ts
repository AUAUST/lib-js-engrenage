import type { ShellToken } from "#tools/github/issues/contract/types/ShellToken";

export type ShellWord =
  | string
  | { readonly op: string }
  | { readonly process: readonly ShellToken[] };
