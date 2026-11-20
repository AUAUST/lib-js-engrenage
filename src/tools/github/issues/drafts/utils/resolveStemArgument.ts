import { newDraftPrefix } from "#tools/github/issues/drafts/constants";
import { parseReference } from "#tools/github/issues/drafts/utils/parseReference";
import { parseStem } from "#tools/github/issues/drafts/utils/parseStem";
import { resolveStem } from "#tools/github/issues/drafts/utils/resolveStem";
import type { DraftReference } from "#tools/github/issues/drafts/types/DraftReference";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";

function parseSlug(argument: string): DraftReference | undefined {
  const dot = argument.lastIndexOf(".");

  const parsed = parseStem(
    `${argument.slice(0, dot + 1)}${newDraftPrefix}${argument.slice(dot + 1)}`,
  );

  return parsed?.kind === "draft" ? parsed : undefined;
}

/**
 * Resolves a command's draft argument: a reference, a draft stem, or a new
 * draft's slug without its `new-` prefix, as `--slug` takes it.
 */
export function resolveStemArgument(
  argument: string,
  context: Pick<DraftsContext, "repository" | "registry">,
): string {
  const parsed = (
    parseReference(argument) ?? parseStem(argument) ?? parseSlug(argument)
  );

  if (parsed === undefined) {
    throw new Error(
      `\`${argument}\` is neither a reference (\`#123\`, \`#{new-foo}\`), a draft stem (\`123\`, \`new-foo\`) nor a new draft's slug (\`foo\`)`,
    );
  }

  return resolveStem(parsed, context).stem;
}
