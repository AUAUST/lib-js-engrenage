import {
  chainSeparator,
  partSeparator,
} from "#tools/github/issues/contract/constants";

export function renderHeader(chain: readonly string[], line: string): string {
  return `${chain.join(chainSeparator)}${partSeparator}${line}`;
}
