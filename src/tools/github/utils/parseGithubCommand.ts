import { isString } from "@auaust/toolkit/isString";

import { parseShellPipelines } from "#tools/github/utils/parseShellPipelines";
import { readShellOperator as readOperator } from "#tools/github/utils/readShellOperator";
import type { GithubBodySource } from "#tools/github/types/GithubBodySource";
import type { GithubWrite } from "#tools/github/types/GithubWrite";
import type { ShellCommand as Command } from "#tools/github/types/ShellCommand";
import type { ShellPipeline as Pipeline } from "#tools/github/types/ShellPipeline";
import type { ShellToken as Token } from "#tools/github/types/ShellToken";
import type { ShellWord as Word } from "#tools/github/types/ShellWord";

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

const heredocReferencePattern = /\0heredoc:(\d+)\0/;

const numberPattern = /^(?:\S*\/issues\/|#)?(\d+)$/;

const repositoryPattern = /([\w.-]+\/[\w.-]+)$/;

const expansionPattern = /\$[({\w]|\$$|`/;

const draftPattern = /(?<![^\s"'()|;&<>])[^\s"'()|;&<>`$]+\.draft\.md(?![\w.-])/;

function findDraft(words: readonly (Token | Word)[]): string | undefined {
  for (const word of words) {
    const draft = isString(word)
      ? draftPattern.exec(word)?.[0]
      : "process" in word
        ? findDraft(word.process)
        : undefined;

    if (draft !== undefined) {
      return draft;
    }
  }
}

function readDraft(words: readonly (Token | Word)[]): GithubBodySource {
  const path = findDraft(words);

  return path === undefined ? { kind: "unreadable" } : { kind: "draft", path };
}

function readFlag(words: Command, names: readonly string[]): Word | undefined {
  for (const [index, word] of words.entries()) {
    if (!isString(word)) {
      continue;
    }

    if (names.includes(word)) {
      return words[index + 1];
    }

    const name = names.find((candidate) => {
      return candidate.startsWith("--") && word.startsWith(`${candidate}=`);
    });

    if (name !== undefined) {
      return word.slice(name.length + 1);
    }
  }
}

function readString(word: Word | undefined): string | undefined {
  return isString(word) ? word : undefined;
}

function readText(
  value: string,
  heredocs: readonly string[],
): GithubBodySource {
  const heredoc = heredocReferencePattern.exec(value)?.[1];

  if (heredoc !== undefined) {
    return { kind: "text", text: heredocs[Number(heredoc)] ?? "" };
  }

  return expansionPattern.test(value)
    ? { kind: "unreadable" }
    : { kind: "text", text: value };
}

function readStandardInput(
  pipeline: Pipeline,
  position: number,
  heredocs: readonly string[],
): GithubBodySource {
  const command = pipeline[position] ?? [];

  for (const [index, word] of command.entries()) {
    const operator = readOperator(word);
    const target = command[index + 1];

    if (operator === "<<<") {
      if (!isString(target)) {
        return { kind: "unreadable" };
      }

      const text = readText(target, heredocs);

      return text.kind === "unreadable" ? readDraft([target]) : text;
    }

    if (operator === "<") {
      if (target === undefined) {
        return { kind: "unreadable" };
      }

      if (!isString(target)) {
        return readDraft([target]);
      }

      return expansionPattern.test(target)
        ? { kind: "unreadable" }
        : { kind: "file", path: target };
    }
  }

  const source = pipeline[position - 1];

  if (source?.length === 3 && source[0] === "cat") {
    const input = readStandardInput(pipeline, position - 1, heredocs);

    if (input.kind === "text") {
      return input;
    }
  }

  return readDraft(pipeline.slice(0, position).flat());
}

function readBody(
  pipeline: Pipeline,
  position: number,
  heredocs: readonly string[],
): GithubBodySource | undefined {
  const command = pipeline[position] ?? [];
  const body = readFlag(command, ["--body", "-b"]);

  if (body !== undefined) {
    return isString(body) ? readText(body, heredocs) : { kind: "unreadable" };
  }

  const file = readFlag(command, ["--body-file", "-F"]);

  if (file === undefined) {
    const input = readStandardInput(pipeline, position, heredocs);

    return input.kind === "text" ? input : undefined;
  }

  if (!isString(file)) {
    return readDraft([file]);
  }

  if (file === "-") {
    return readStandardInput(pipeline, position, heredocs);
  }

  return expansionPattern.test(file)
    ? { kind: "unreadable" }
    : { kind: "file", path: file };
}

function readNumber(words: Command): number | undefined {
  for (const [index, word] of words.entries()) {
    const previous = words[index - 1];

    if (
      !isString(word) ||
      word.startsWith("-") ||
      (isString(previous) && valueFlags.has(previous))
    ) {
      continue;
    }

    const number = numberPattern.exec(word)?.[1];

    return number === undefined ? undefined : Number(number);
  }
}

function readWrite(
  pipeline: Pipeline,
  position: number,
  heredocs: readonly string[],
): GithubWrite | undefined {
  const command = pipeline[position] ?? [];

  const start = command.findIndex((word, index) => {
    return word === "gh" && command[index + 1] === "issue";
  });

  const action = actions.find((candidate) => {
    return candidate === command[start + 2];
  });

  if (start === -1 || action === undefined) {
    return;
  }

  const words = command.slice(start + 3);
  const repository = readString(readFlag(words, ["--repo", "-R"]));

  return {
    action,
    number: action === "create" ? undefined : readNumber(words),
    repository: repository === undefined
      ? undefined
      : repositoryPattern.exec(repository)?.[1],
    title: readString(readFlag(words, ["--title", "-t"])),
    body: readBody(pipeline, position, heredocs),
  };
}

// @debt the hook parses shell, with `shell-quote` and heredocs lifted by hand, only because agents publish drafts through `gh`; a publishing command would remove it (#217).
export function parseGithubCommand(command: string): readonly GithubWrite[] {
  const { pipelines, heredocs } = parseShellPipelines(command);
  const writes: GithubWrite[] = [];

  for (const pipeline of pipelines) {
    for (const position of pipeline.keys()) {
      const write = readWrite(pipeline, position, heredocs);

      if (write !== undefined) {
        writes.push(write);
      }
    }
  }

  return writes;
}
