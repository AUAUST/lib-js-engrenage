import {
  parseShell,
  type ShellCommand,
  type ShellWord,
} from "#foundation/shell/index";
import type { GithubBodySource } from "#tools/github/issues/contract/types/GithubBodySource";
import type { GithubWrite } from "#tools/github/issues/contract/types/GithubWrite";

const actions = [
  "create",
  "edit",
  "comment",
] as const satisfies readonly GithubWrite["action"][];

const valueFlags = new Set([
  "--title",
  "-t",
  "--body",
  "-b",
  "--body-file",
  "-F",
  "--repo",
  "-R",
  "--label",
  "-l",
  "--add-label",
  "--remove-label",
  "--assignee",
  "-a",
  "--add-assignee",
  "--remove-assignee",
  "--milestone",
  "-m",
  "--project",
  "-p",
  "--add-project",
  "--remove-project",
  "--template",
  "-T",
]);

const numberPattern = /^(?:\S*\/issues\/|#)?(\d+)$/;

const repositoryPattern = /([\w.-]+\/[\w.-]+)$/;

const unreadable = { kind: "unreadable" } as const;

function readLiteral(word: ShellWord | undefined): string | undefined {
  return word?.kind === "literal" ? word.text : undefined;
}

function readFlag(
  words: readonly ShellWord[],
  names: readonly string[],
): ShellWord | undefined {
  for (const [index, word] of words.entries()) {
    if (word.kind !== "literal") {
      continue;
    }

    if (names.includes(word.text)) {
      return words[index + 1];
    }

    const name = names.find((candidate) => {
      return (
        candidate.startsWith("--") && word.text.startsWith(`${candidate}=`)
      );
    });

    if (name !== undefined) {
      return { kind: "literal", text: word.text.slice(name.length + 1) };
    }
  }
}

function isBareCat(command: ShellCommand) {
  return command.words.length === 1 && readLiteral(command.words[0]) === "cat";
}

function readHeredoc(command: ShellCommand): GithubBodySource | undefined {
  for (const { operator, target, heredoc } of command.redirects) {
    if (heredoc !== undefined) {
      const text = readLiteral(heredoc);

      return text === undefined ? unreadable : { kind: "text", text };
    }

    if (operator === "<<<") {
      const text = readLiteral(target);

      return text === undefined ? unreadable : { kind: "text", text };
    }
  }
}

function readStandardInput(command: ShellCommand): GithubBodySource {
  const heredoc = readHeredoc(command);

  if (heredoc !== undefined) {
    return heredoc;
  }

  const file = command.redirects.find(({ operator }) => operator === "<");

  if (file !== undefined) {
    const path = readLiteral(file.target);

    return path === undefined ? unreadable : { kind: "file", path };
  }

  return command.input !== undefined && isBareCat(command.input)
    ? readStandardInput(command.input)
    : unreadable;
}

function readBodyText(word: ShellWord): GithubBodySource {
  if (word.kind === "literal") {
    return { kind: "text", text: word.text };
  }

  const [only, ...others] = word.kind === "substitution" ? word.commands : [];

  if (only === undefined || others.length > 0 || !isBareCat(only)) {
    return unreadable;
  }

  const heredoc = readHeredoc(only);

  return heredoc?.kind === "text" ? heredoc : unreadable;
}

function readBody(
  command: ShellCommand,
  words: readonly ShellWord[],
): GithubBodySource | undefined {
  const body = readFlag(words, ["--body", "-b"]);

  if (body !== undefined) {
    return readBodyText(body);
  }

  const file = readFlag(words, ["--body-file", "-F"]);

  if (file === undefined) {
    const input = readStandardInput(command);

    return input.kind === "text" ? input : undefined;
  }

  const path = readLiteral(file);

  if (path === "-") {
    return readStandardInput(command);
  }

  return path === undefined ? unreadable : { kind: "file", path };
}

function readNumber(words: readonly ShellWord[]): number | undefined {
  for (const [index, word] of words.entries()) {
    const text = readLiteral(word);
    const previous = readLiteral(words[index - 1]);

    if (
      text === undefined ||
      text.startsWith("-") ||
      (previous !== undefined && valueFlags.has(previous))
    ) {
      continue;
    }

    const number = numberPattern.exec(text)?.[1];

    return number === undefined ? undefined : Number(number);
  }
}

function readWrite(command: ShellCommand): GithubWrite | undefined {
  const texts = command.words.map(readLiteral);

  const start = texts.findIndex((text, index) => {
    return text === "gh" && texts[index + 1] === "issue";
  });

  const action = actions.find((candidate) => {
    return candidate === texts[start + 2];
  });

  if (start === -1 || action === undefined) {
    return;
  }

  const words = command.words.slice(start + 3);
  const repository = readLiteral(readFlag(words, ["--repo", "-R"]));

  return {
    action,
    number: action === "create" ? undefined : readNumber(words),
    repository: repository === undefined
      ? undefined
      : repositoryPattern.exec(repository)?.[1],
    title: readLiteral(readFlag(words, ["--title", "-t"])),
    body: readBody(command, words),
  };
}

// @debt the hook parses shell, through the shared `foundation/shell` parser, only because agents publish drafts through `gh`; a publishing command would remove it (#217).
export function parseGithubCommand(command: string): readonly GithubWrite[] {
  return parseShell(command).flatMap((shellCommand) => {
    const write = readWrite(shellCommand);

    return write === undefined ? [] : [write];
  });
}
