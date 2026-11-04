import { getOptionsEnd } from "#cli/utils/getOptionsEnd";
import { isOptionOf } from "#cli/utils/isOptionOf";

export function hasOption(
  args: readonly string[],
  options: readonly string[],
): boolean {
  return args.slice(0, getOptionsEnd(args)).some((arg) => {
    return isOptionOf(arg, options);
  });
}
