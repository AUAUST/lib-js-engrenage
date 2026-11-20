import { readShellFlag } from "#tools/github/issues/contract/utils/readShellFlag";
import { readShellLiteral } from "#tools/github/issues/contract/utils/readShellLiteral";
import type { ShellWord } from "#foundation/shell/index";

const repositoryPattern = /([\w.-]+\/[\w.-]+)$/;

export function readRepositoryFlag(
  words: readonly ShellWord[],
): string | undefined {
  const repository = readShellLiteral(readShellFlag(words, ["--repo", "-R"]));

  return repository === undefined
    ? undefined
    : repositoryPattern.exec(repository)?.[1];
}
