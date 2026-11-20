import { replaceOutsideCode } from "#foundation/markdown/index";
import { findShortName } from "#tools/github/issues/drafts/utils/findShortName";
import { toDraftReference } from "#tools/github/issues/drafts/utils/toDraftReference";
import { toLocalStem } from "#tools/github/issues/drafts/utils/toLocalStem";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";

const referencePattern = /(?<![\w/.&-])(?:https:\/\/github\.com\/([\w.-]+\/[\w.-]+)\/(?:issues|pull)\/(\d+)(?![\w#/-])|([\w.-]+\/[\w.-]+)#(\d+)(?![\w#/-])|#(\d+)\b)/gi;

export function localizeReferences(
  text: string,
  source: string | undefined,
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

      if (repository === undefined) {
        return match;
      }

      const current = context.repository?.toLowerCase();

      const known = (
        (current !== undefined &&
          repository.toLowerCase() === current &&
          source?.toLowerCase() === current) ||
        findShortName(repository, context) !== undefined
      );

      return known
        ? toDraftReference(
            toLocalStem(
              {
                repository,
                number: Number(urlNumber || fullNumber || plain),
              },
              source,
              context,
            ),
          )
        : match;
    },
  );
}
