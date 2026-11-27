import type { Loadable } from "#foundation/modules/index";
import type { CommandEntry } from "#nexus/cli/types/CommandEntry";
import type { CommandSource } from "#nexus/cli/types/CommandSource";

/**
 * Loads subcommands of a group known only once loaded: a command entry, a list of
 * them or a source, or a module default-exporting one; routing calls it only when
 * no earlier subcommand or loader of the group provides the name it looks up.
 */
export type CommandLoader = () => Promise<
  Loadable<CommandEntry | readonly CommandEntry[] | CommandSource>
>;
