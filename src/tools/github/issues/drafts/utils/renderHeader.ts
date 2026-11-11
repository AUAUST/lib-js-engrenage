import {
  chainSeparator,
  headerSeparator,
} from "#tools/github/issues/drafts/constants";

export function renderHeader(chain: readonly number[], line: string): string {
  return `${chain
    .map((number) => {
      return `#${number}`;
    })
    .join(chainSeparator)}${headerSeparator}${line}`;
}
