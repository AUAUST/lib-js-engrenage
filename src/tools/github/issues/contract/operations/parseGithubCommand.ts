import { posix } from "node:path";

import { isString } from "@auaust/toolkit";

import {
  parseShell,
  type ShellCommand,
  type ShellWord,
} from "#foundation/shell/index";
import { readIssueNumber } from "#tools/github/issues/contract/utils/readIssueNumber";
import { readRepositoryFlag } from "#tools/github/issues/contract/utils/readRepositoryFlag";
import { readShellFlag } from "#tools/github/issues/contract/utils/readShellFlag";
import { readShellLiteral } from "#tools/github/issues/contract/utils/readShellLiteral";
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

const unreadable = { kind: "unreadable" } as const;

type ShellDirectory = string | undefined | typeof unreadable;

function resolvePath(
  path: string,
  directory: ShellDirectory,
): GithubBodySource {
  if (directory === undefined || posix.isAbsolute(path)) {
    return { kind: "file", path };
  }

  return isString(directory)
    ? { kind: "file", path: posix.join(directory, path) }
    : unreadable;
}

function readDirectory(
  command: ShellCommand,
  directory: ShellDirectory,
): ShellDirectory {
  if (readShellLiteral(command.words[0]) !== "cd") {
    return directory;
  }

  const path = command.words.length === 2
    ? readShellLiteral(command.words[1])
    : undefined;

  if (path === undefined || path === "-" || path.startsWith("~")) {
    return unreadable;
  }

  if (posix.isAbsolute(path)) {
    return path;
  }

  return directory === undefined || isString(directory)
    ? posix.join(directory ?? ".", path)
    : unreadable;
}

function isBareCat(command: ShellCommand) {
  return (
    command.words.length === 1 && readShellLiteral(command.words[0]) === "cat"
  );
}

function readHeredoc(command: ShellCommand): GithubBodySource | undefined {
  for (const { operator, target, heredoc } of command.redirects) {
    if (heredoc !== undefined) {
      const text = readShellLiteral(heredoc);

      return text === undefined ? unreadable : { kind: "text", text };
    }

    if (operator === "<<<") {
      const text = readShellLiteral(target);

      return text === undefined ? unreadable : { kind: "text", text };
    }
  }
}

function readStandardInput(
  command: ShellCommand,
  directory: ShellDirectory,
): GithubBodySource {
  const heredoc = readHeredoc(command);

  if (heredoc !== undefined) {
    return heredoc;
  }

  const file = command.redirects.find(({ operator }) => operator === "<");

  if (file !== undefined) {
    const path = readShellLiteral(file.target);

    return path === undefined ? unreadable : resolvePath(path, directory);
  }

  return command.input !== undefined && isBareCat(command.input)
    ? readStandardInput(command.input, directory)
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
  directory: ShellDirectory,
): GithubBodySource | undefined {
  const body = readShellFlag(words, ["--body", "-b"]);

  if (body !== undefined) {
    return readBodyText(body);
  }

  const file = readShellFlag(words, ["--body-file", "-F"]);

  if (file === undefined) {
    const input = readStandardInput(command, directory);

    return input.kind === "text" ? input : undefined;
  }

  const path = readShellLiteral(file);

  if (path === "-") {
    return readStandardInput(command, directory);
  }

  return path === undefined ? unreadable : resolvePath(path, directory);
}

function readWrite(
  command: ShellCommand,
  directory: ShellDirectory,
): GithubWrite | undefined {
  const texts = command.words.map(readShellLiteral);

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

  return {
    action,
    number: action === "create"
      ? undefined
      : readIssueNumber(words, valueFlags),
    repository: readRepositoryFlag(words),
    title: readShellLiteral(readShellFlag(words, ["--title", "-t"])),
    body: readBody(command, words, directory),
  };
}

// @debt the hook parses shell, through the shared `foundation/shell` parser, because agents may still write issues through `gh` directly (#207 › Decisions).
export function parseGithubCommand(command: string): readonly GithubWrite[] {
  const writes: GithubWrite[] = [];

  let directory: ShellDirectory;

  for (const shellCommand of parseShell(command)) {
    directory = readDirectory(shellCommand, directory);

    const write = readWrite(shellCommand, directory);

    if (write !== undefined) {
      writes.push(write);
    }
  }

  return writes;
}
