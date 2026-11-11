import {
  replaceOutsideCode,
  type IssueContract,
} from "#tools/github/issues/contract/index";
import { splitBodySections } from "#tools/github/issues/drafts/utils/splitBodySections";

function rewriteFullReferences(text: string, repository: string) {
  const name = RegExp.escape(repository);

  return replaceOutsideCode(
    text,
    new RegExp(
      String.raw`(?<![\w/.-])(?:https://github\.com/${name}/(?:issues|pull)/|${name}#)(\d+)(?![\w#/-])`,
      "gi",
    ),
    (_, number = "") => `#${number}`,
  );
}

export function toDraftBody(
  body: string,
  repository: string,
  contract: IssueContract | undefined,
): string {
  const generated = new Set(contract?.generated);

  const kept = splitBodySections(body)
    .filter(({ name }) => {
      return name === undefined || !generated.has(name);
    })
    .flatMap(({ lines }) => lines)
    .join("\n");

  return rewriteFullReferences(kept, repository).trim();
}
