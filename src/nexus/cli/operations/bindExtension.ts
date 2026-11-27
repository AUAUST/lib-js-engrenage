import type { Command } from "@commander-js/extra-typings";

/**
 * Binds `extend` to each command instance it extends, so it runs at most once
 * per instance however often the instance parses or shows its help.
 *
 * @pure
 */
export function bindExtension(
  extend: (command: Command) => Promise<void>,
): (command: Command) => Promise<void> {
  const extensions = new WeakMap<Command, Promise<void>>();

  return (command) => {
    let extension = extensions.get(command);

    if (extension === undefined) {
      extension = extend(command);

      extensions.set(command, extension);
    }

    return extension;
  };
}
