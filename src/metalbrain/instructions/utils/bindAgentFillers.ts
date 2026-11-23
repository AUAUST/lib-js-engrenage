import { loadLazy } from "#foundation/modules/index";
import { builtInFillers } from "#metalbrain/instructions/constants";
import type { Contribution } from "#foundation/extensions/index";
import type { AgentFiller } from "#metalbrain/instructions/ports/AgentFiller";
import type { BlockFillers } from "#types/BlockFillers";

/**
 * The contributed fillers, each bound to the host's input.
 *
 * @throws {Error} A filler takes a built-in filler's name, or two take
 * the same name.
 */
export function bindAgentFillers<Host>(
  contributions: readonly Contribution<
    { readonly name: string },
    AgentFiller<Host>
  >[],
  host: Host,
): BlockFillers {
  const fillers: BlockFillers = {};

  for (const { entry, extension } of contributions) {
    if (builtInFillers.some((name) => name === entry.name)) {
      throw new Error(
        `Agent filler "@${entry.name}" is built in and cannot be contributed, by ${extension.name}`,
      );
    }

    if (entry.name in fillers) {
      throw new Error(
        `Agent filler "@${entry.name}" is contributed twice, the second time by ${extension.name}`,
      );
    }

    fillers[entry.name] = async (...args) => {
      const fill = await loadLazy(entry);

      return fill(host, ...args);
    };
  }

  return fillers;
}
