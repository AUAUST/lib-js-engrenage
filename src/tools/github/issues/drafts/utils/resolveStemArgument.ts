import { parseReference } from "#tools/github/issues/drafts/utils/parseReference";
import { parseStem } from "#tools/github/issues/drafts/utils/parseStem";
import { resolveStem } from "#tools/github/issues/drafts/utils/resolveStem";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";

export function resolveStemArgument(
  argument: string,
  context: Pick<DraftsContext, "repository" | "registry">,
): string {
  const parsed = parseReference(argument) ?? parseStem(argument);

  if (parsed === undefined) {
    throw new Error(
      `\`${argument}\` is neither a reference (\`#123\`, \`#{new-foo}\`) nor a draft stem (\`123\`, \`new-foo\`)`,
    );
  }

  return resolveStem(parsed, context).stem;
}
