import {
  externalWriteNotice,
  externalWritePrefix,
} from "#tools/github/issues/contract/constants";

export function renderExternalWriteMarker(repository: string): string {
  return `${externalWritePrefix} ${repository}: ${externalWriteNotice}`;
}
