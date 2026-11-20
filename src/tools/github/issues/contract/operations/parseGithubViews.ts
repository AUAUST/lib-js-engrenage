import { parseShell, type ShellCommand } from "#foundation/shell/index";
import { readIssueNumber } from "#tools/github/issues/contract/utils/readIssueNumber";
import { readRepositoryFlag } from "#tools/github/issues/contract/utils/readRepositoryFlag";
import { readShellFlag } from "#tools/github/issues/contract/utils/readShellFlag";
import { readShellLiteral } from "#tools/github/issues/contract/utils/readShellLiteral";
import type { GithubView } from "#tools/github/issues/contract/types/GithubView";

const valueFlags = new Set([
  "--json",
  "--jq",
  "-q",
  "--template",
  "-t",
  "--repo",
  "-R",
]);

function readView(command: ShellCommand): GithubView | undefined {
  const texts = command.words.map(readShellLiteral);

  const start = texts.findIndex((text, index) => {
    return (
      text === "gh" &&
      texts[index + 1] === "issue" &&
      texts[index + 2] === "view"
    );
  });

  if (start === -1) {
    return;
  }

  const words = command.words.slice(start + 3);
  const flags = new Set(texts.slice(start + 3));
  const fields = readShellLiteral(readShellFlag(words, ["--json"]));

  return {
    number: readIssueNumber(words, valueFlags),
    repository: readRepositoryFlag(words),
    fields: fields?.split(",").map((field) => field.trim()),
    comments: flags.has("--comments") || flags.has("-c"),
  };
}

// @debt a `for` loop over literal issue numbers reaches `gh issue view` as `$n`, an expansion the shell parser does not resolve, so such views stay unparsed
export function parseGithubViews(command: string): readonly GithubView[] {
  return parseShell(command).flatMap((shellCommand) => {
    const view = readView(shellCommand);

    return view === undefined ? [] : [view];
  });
}
