import type { ShellCommand } from "#foundation/shell/types/ShellCommand";

export type ShellWord =
  | { readonly kind: "literal"; readonly text: string }
  | {
      readonly kind: "substitution";
      readonly source: string;
      readonly commands: readonly ShellCommand[];
    }
  | { readonly kind: "pattern"; readonly source: string }
  | { readonly kind: "expansion"; readonly source: string };
