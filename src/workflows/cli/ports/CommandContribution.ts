import type { EntryShape } from "#foundation/extensions/index";
import type { Lazy } from "#foundation/modules/index";
import type { CommandDeclaration } from "#nexus/cli/index";

/**
 * A command engrenage mounts under `name` and `aliases`, after its built-ins
 * and before the project's scripts, loading its declaration only once a run
 * names it or every command loads; it fails before its action while its
 * extension is inactive.
 *
 * @experimental
 */
export interface CommandContribution
  extends EntryShape, Lazy<CommandDeclaration> {
  /**
   * Name of the command, unique across the slot.
   */
  readonly name: string;
  /**
   * Other names the command runs under, failing as a configuration error where
   * every command loads when another command has one.
   */
  readonly aliases?: readonly string[];
}

declare global {
  namespace Engrenage {
    interface Slots {
      "cli.commands": CommandContribution;
    }
  }
}
