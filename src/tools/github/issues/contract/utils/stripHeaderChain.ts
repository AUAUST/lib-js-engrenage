import {
  chainSeparator,
  partSeparator,
  qualifiedReferenceSource,
} from "#tools/github/issues/contract/constants";

const chainPattern = new RegExp(
  String.raw`^${qualifiedReferenceSource}(?:${RegExp.escape(chainSeparator)}${qualifiedReferenceSource})*(?:${RegExp.escape(partSeparator)}|[ \t]*(?:\n|$))`,
);

export function stripHeaderChain(body: string): string {
  return body.trim().replace(chainPattern, "").trim();
}
