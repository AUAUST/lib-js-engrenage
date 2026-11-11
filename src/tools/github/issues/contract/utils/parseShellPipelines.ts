import { parse, type ParseEntry as Token } from "shell-quote";

import { isString } from "@auaust/toolkit/isString";

import { readShellOperator as readOperator } from "#tools/github/issues/contract/utils/readShellOperator";
import type { ShellCommand as Command } from "#tools/github/issues/contract/types/ShellCommand";
import type { ShellPipeline as Pipeline } from "#tools/github/issues/contract/types/ShellPipeline";
import type { ShellWord as Word } from "#tools/github/issues/contract/types/ShellWord";

const separators = new Set(["||", "&&", ";;", "&", ";", "(", ")"]);

const pipes = new Set(["|", "|&"]);

const heredocPattern = /(?<!<)<<-?[ \t]*(['"]?)(\w+)\1(?!<)/;

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

  let rest:
    string | undefined = text.replaceAll("\\\n", "").replaceAll("\n", "\n;");

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

export function parseShellPipelines(command: string) {
  const { text, heredocs } = liftHeredocs(command);

  return { pipelines: splitPipelines(tokenize(text)), heredocs };
}
