import {
  externalWritePrefix,
  partSeparator,
} from "#tools/github/issues/contract/constants";

const markerPattern = new RegExp(
  String.raw`^${RegExp.escape(externalWritePrefix)} [\w.-]+\/[\w.-]+:[^\n]*?(?:${RegExp.escape(partSeparator)}|[ \t]*(?:\n|$))`,
);

export function stripExternalWriteMarker(text: string): string {
  return text.replace(markerPattern, "");
}
