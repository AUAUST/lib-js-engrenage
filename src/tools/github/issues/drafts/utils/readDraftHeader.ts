import { splitBodySections } from "#tools/github/issues/drafts/utils/splitBodySections";

export function readDraftHeader(body: string): string | undefined {
  const [preamble] = splitBodySections(body);

  const header = preamble?.name === undefined
    ? preamble?.lines.join("\n").trim()
    : undefined;

  return header === "" ? undefined : header;
}
