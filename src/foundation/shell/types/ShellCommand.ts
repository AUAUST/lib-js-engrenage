import type { ShellAssignment } from "#foundation/shell/types/ShellAssignment";
import type { ShellRedirect } from "#foundation/shell/types/ShellRedirect";
import type { ShellWord } from "#foundation/shell/types/ShellWord";

export interface ShellCommand {
  readonly words: readonly ShellWord[];
  readonly assignments: readonly ShellAssignment[];
  readonly redirects: readonly ShellRedirect[];
  readonly input: ShellCommand | undefined;
}
