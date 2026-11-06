import { parse, type ParseEntry as Token } from "shell-quote";

import { isString } from "@auaust/toolkit/isString";

import type { GithubBodySource } from "#tools/github/types/GithubBodySource";
import type { GithubWrite } from "#tools/github/types/GithubWrite";

type Word =
  string | { readonly op: string } | { readonly process: readonly Token[] };

type Command = readonly Word[];

type Pipeline = readonly Command[];

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

const separators = new Set(["||", "&&", ";;", "&", ";", "(", ")"]);

const pipes = new Set(["|", "|&"]);

const heredocPattern = /(?<!<)<<-?[ \t]*(['"]?)(\w+)\1(?!<)/;

const heredocReferencePattern = /\0heredoc:(\d+)\0/;

const numberPattern = /^(?:\S*\/issues\/|#)?(\d+)$/;

const repositoryPattern = /([\w.-]+\/[\w.-]+)$/;

const expansionPattern = /\$[({\w]|\$$|`/;

const draftPattern =
  /(?<![^\s"'()|;&<>])[^\s"'()|;&<>`$]+\.draft\.md(?![\w.-])/;

function liftHeredocs(command: string) {
  const heredocs: string[] = [];

  let text = command;
  let match = heredocPattern.exec(text);

  while (match !== null) {
    const delimiter = match[2];
    const operator = `<<< \0heredoc:${heredocs.length}\0`;
    const opening = text.slice(match.index + match[0].length);
    const lineEnd = opening.indexOf("\n");
    const lines = lineEnd === -1 ? [] : opening.slice(lineEnd + 1).split("\n");
    const end = lines.findIndex((line) => line.trim() === delimiter);

    heredocs.push((end === -1 ? lines : lines.slice(0, end)).join("\n"));

    text = [
      text.slice(0, match.index),
      operator,
      lineEnd === -1 ? opening : opening.slice(0, lineEnd + 1),
      end === -1 ? "" : lines.slice(end + 1).join("\n"),
    ].join("");

    match = heredocPattern.exec(text);
  }

  return { text, heredocs };
}

function readComment(token: Token | undefined): string | undefined {
  return token === undefined || isString(token) || !("comment" in token)
    ? undefined
    : token.comment;
}

function tokenize(text: string): Token[] {
  const tokens: Token[] = [];

  let rest: string | undefined = text
    .replaceAll("\\\n", "")
    .replaceAll("\n", "\n;");

  while (rest !== undefined) {
    const parsed = parse(rest, (key) => `$${key}`);
    const comment = readComment(parsed.at(-1));
    const resume = comment?.indexOf("\n") ?? -1;

    if (comment === undefined || resume === -1) {
      tokens.push(...parsed);
      rest = undefined;
    } else {
      tokens.push(...parsed.slice(0, -1), { op: ";" });
      rest = comment.slice(resume + 1);
    }
  }

  return tokens.map((token) => {
    return isString(token) ? token.replaceAll("\n;", "\n") : token;
  });
}

function readOperator(token: Token | Word | undefined): string | undefined {
  return token === undefined || isString(token) || !("op" in token)
    ? undefined
    : token.op;
}

function readProcess(tokens: readonly Token[], start: number) {
  let depth = 1;
  let index = start;

  while (index < tokens.length && depth > 0) {
    const operator = readOperator(tokens[index]);

    if (operator === "<(" || operator === "(") {
      depth += 1;
    }

    if (operator === ")") {
      depth -= 1;
    }

    index += 1;
  }

  return {
    process: tokens.slice(start, depth === 0 ? index - 1 : index),
    next: index,
  };
}

function splitPipelines(tokens: readonly Token[]): Pipeline[] {
  const pipelines: Pipeline[] = [];

  let pipeline: Command[] = [];
  let command: Word[] = [];
  let piped = false;
  let index = 0;

  function closeCommand() {
    if (!(command.length > 0)) {
      return;
    }

    pipeline.push(command);
    command = [];
  }

  function closePipeline() {
    if (!(pipeline.length > 0)) {
      return;
    }

    pipelines.push(pipeline);
    pipeline = [];
  }

  while (index < tokens.length) {
    const token = tokens[index];

    index += 1;

    if (isString(token)) {
      command.push(token);
      piped = false;
      continue;
    }

    if (token === undefined || "comment" in token) {
      continue;
    }

    if ("pattern" in token) {
      command.push(token.pattern);
      continue;
    }

    if (token.op === "<(") {
      const { process, next } = readProcess(tokens, index);

      command.push({ process });
      index = next;
      continue;
    }

    if (pipes.has(token.op)) {
      closeCommand();
      piped = true;
      continue;
    }

    if (separators.has(token.op)) {
      if (command.length > 0 || !piped) {
        closeCommand();
        closePipeline();
        piped = false;
      }

      continue;
    }

    command.push({ op: token.op });
  }

  closeCommand();
  closePipeline();

  return pipelines;
}

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
    repository:
      repository === undefined
        ? undefined
        : repositoryPattern.exec(repository)?.[1],
    title: readString(readFlag(words, ["--title", "-t"])),
    body: readBody(pipeline, position, heredocs),
  };
}

// @debt the hook parses shell, with `shell-quote` and heredocs lifted by hand, only because agents publish drafts through `gh`; a publishing command would remove it (#217).
export function parseGithubCommand(command: string): readonly GithubWrite[] {
  const { text, heredocs } = liftHeredocs(command);
  const writes: GithubWrite[] = [];

  for (const pipeline of splitPipelines(tokenize(text))) {
    for (const position of pipeline.keys()) {
      const write = readWrite(pipeline, position, heredocs);

      if (write !== undefined) {
        writes.push(write);
      }
    }
  }

  return writes;
}
