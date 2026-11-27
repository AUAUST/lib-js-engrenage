import { invocationSeparator } from "#nexus/cli/constants";

/**
 * Splits `args` into invocations on each bare `--next` token; a `--` ends the
 * split, the rest of `args`, the `--` included, belonging to the last one.
 *
 * @pure
 */
export function splitInvocations(args: readonly string[]): string[][] {
  const invocations: string[][] = [[]];

  for (const [index, arg] of args.entries()) {
    if (arg === "--") {
      invocations.at(-1)?.push(...args.slice(index));

      break;
    }

    if (arg === invocationSeparator) {
      invocations.push([]);
    } else {
      invocations.at(-1)?.push(arg);
    }
  }

  return invocations;
}
