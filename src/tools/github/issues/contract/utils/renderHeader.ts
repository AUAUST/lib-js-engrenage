import {
  chainSeparator,
  partSeparator,
} from "#tools/github/issues/contract/constants";

export function renderHeader(
  chain: readonly string[],
  ...parts: readonly string[]
): string {
  return [
    ...(chain.length === 0 ? [] : [chain.join(chainSeparator)]),
    ...parts,
  ].join(partSeparator);
}
