import type { ShellWord } from "#foundation/shell/types/ShellWord";

export interface ShellRedirect {
  readonly operator: string;
  readonly target: ShellWord;
  readonly heredoc: ShellWord | undefined;
}
