import {
  chainSeparator,
  headerSeparator,
} from "#tools/github/issues/drafts/constants";

export function renderHeader(chain: readonly string[], line: string): string {
  return `${chain.join(chainSeparator)}${headerSeparator}${line}`;
}
