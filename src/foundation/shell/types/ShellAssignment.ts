import type { ShellWord } from "#foundation/shell/types/ShellWord";

export interface ShellAssignment {
  readonly name: string;
  readonly value: ShellWord;
}
