import type { ParseEntry } from "shell-quote";

export type ShellWord =
  | string
  | { readonly op: string }
  | { readonly process: readonly ParseEntry[] };
