import {
  replaceOutsideCode,
  type IssueContract,
} from "#tools/github/issues/contract/index";
import {
  chainSeparator,
  headerSeparator,
} from "#tools/github/issues/drafts/constants";
import { findShortName } from "#tools/github/issues/drafts/utils/findShortName";
import { splitBodySections } from "#tools/github/issues/drafts/utils/splitBodySections";
import { toDraftReference } from "#tools/github/issues/drafts/utils/toDraftReference";
import { toLocalStem } from "#tools/github/issues/drafts/utils/toLocalStem";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";

const chainReference = String.raw`(?:[\w.-]+/[\w.-]+)?#\d+`;

const chainPattern = new RegExp(
  String.raw`^${chainReference}(?:${RegExp.escape(chainSeparator)}${chainReference})*(?:${RegExp.escape(headerSeparator)}|[ \t]*(?:\n|$))`,
);

const referencePattern = /(?<![\w/.&-])(?:https:\/\/github\.com\/([\w.-]+\/[\w.-]+)\/(?:issues|pull)\/(\d+)(?![\w#/-])|([\w.-]+\/[\w.-]+)#(\d+)(?![\w#/-])|#(\d+)\b)/gi;

function localizeReferences(
  text: string,
  source: string,
  context: Pick<DraftsContext, "repository" | "registry">,
) {
  return replaceOutsideCode(
    text,
    referencePattern,
    (
      match,
      url = "",
      urlNumber = "",
      full = "",
      fullNumber = "",
      plain = "",
    ) => {
      const repository = url || full || source;

      const known = (
        repository.toLowerCase() === context.repository.toLowerCase() ||
        findShortName(repository, context) !== undefined
      );

      return known
        ? toDraftReference(
            toLocalStem(
              { repository, number: Number(urlNumber || fullNumber || plain) },
              context,
            ),
          )
        : match;
    },
  );
}

export function toDraftBody(
  body: string,
  source: string,
  context: Pick<DraftsContext, "repository" | "registry">,
  contract: IssueContract | undefined,
): string {
  const generated = new Set(contract?.generated);

  const kept = splitBodySections(body)
    .filter(({ name }) => {
      return name === undefined || !generated.has(name);
    })
    .flatMap(({ lines }) => lines)
    .join("\n");

  return localizeReferences(
    kept.trim().replace(chainPattern, "").trim(),
    source,
    context,
  );
}
