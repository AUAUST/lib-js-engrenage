import {
  externalWritePrefix,
  partSeparator,
} from "#tools/github/issues/contract/constants";

const marker = String.raw`${RegExp.escape(externalWritePrefix)} [\w.-]+\/[\w.-]+:`;

// @debt the unquoted alternative only reads issues published before the marker was quoted; drop it once none remain
const markerPattern = new RegExp(
  String.raw`^(?:> ${marker}[^\n]*(?:\n+|$)|${marker}[^\n]*?(?:${RegExp.escape(partSeparator)}|[ \t]*(?:\n|$)))`,
);

export function stripExternalWriteMarker(text: string): string {
  return text.replace(markerPattern, "");
}
