import type { ShellWord } from "#foundation/shell/types/ShellWord";

export interface ShellRedirect {
  // @debt `operator` is source text holding any file descriptor (`0<`, `2>&1`), so consumers comparing it to `<` or `<<<` miss an explicit `0`; a typed operator and descriptor would let them match exactly
  readonly operator: string;
  readonly target: ShellWord;
  readonly heredoc: ShellWord | undefined;
}
