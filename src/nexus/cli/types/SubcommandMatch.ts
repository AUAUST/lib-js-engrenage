import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";

/**
 * What looking a name up among a group's subcommands yields.
 */
export type SubcommandMatch =
  | { readonly kind: "found"; readonly command: CommandDeclaration }
  /**
   * No source provides the name, and every source loaded.
   */
  | { readonly kind: "missing" }
  /**
   * No source that loaded provides the name, and a loader failed: the source it
   * fails to load may provide it.
   */
  | { readonly kind: "unresolved" };
