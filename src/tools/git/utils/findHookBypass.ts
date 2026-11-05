import { max } from "@auaust/toolkit/math";

const assignmentPattern = /^[A-Za-z_]\w*=/;

const hooksPathPattern = /^core\.hookspath(?:=|$)/i;

const shortValueFlags = new Set(["m", "F", "C", "c", "t"]);

const longValueFlags = new Set([
  "--message",
  "--file",
  "--reuse-message",
  "--reedit-message",
  "--fixup",
  "--squash",
  "--author",
  "--date",
  "--template",
  "--cleanup",
  "--pathspec-from-file",
]);

const globalValueFlags = new Set([
  "-C",
  "--git-dir",
  "--work-tree",
  "--namespace",
  "--exec-path",
  "--super-prefix",
  "--config-env",
]);

function parse(source: string, start: number, close?: ")" | "`") {
  const commands: string[][] = [];

  let words: string[] = [];
  let word: string | undefined;
  let quote: '"' | "'" | undefined;
  let depth = 0;
  let index = start;

  function endWord() {
    if (word !== undefined) {
      words.push(word);
    }

    word = undefined;
  }

  function endCommand() {
    endWord();

    if (words.length > 0) {
      commands.push(words);
    }

    words = [];
  }

  for (; index < source.length; index++) {
    const char = source[index];

    if (quote === "'") {
      if (char === "'") {
        quote = undefined;
      } else {
        word += char;
      }

      continue;
    }

    if (char === "\\") {
      word = (word ?? "") + (source[++index] ?? "");

      continue;
    }

    if (char === "`" && close === "`") {
      break;
    }

    if (char === "`" || (char === "$" && source[index + 1] === "(")) {
      const inner = parse(
        source,
        index + (char === "`" ? 1 : 2),
        char === "`" ? "`" : ")",
      );

      commands.push(...inner.commands);
      index = inner.end;

      continue;
    }

    if (char === '"') {
      quote = quote === '"' ? undefined : '"';
      word ??= "";

      continue;
    }

    if (char === "'" && quote === undefined) {
      quote = "'";
      word ??= "";

      continue;
    }

    if (quote === '"') {
      word = (word ?? "") + char;

      continue;
    }

    if (char === "(") {
      depth++;
      endCommand();
    } else if (char === ")") {
      if (depth === 0 && close === ")") {
        break;
      }

      depth = max(0, depth - 1);
      endCommand();
    } else if (char === ";" || char === "|" || char === "&" || char === "\n") {
      endCommand();
    } else if (char === " " || char === "\t") {
      endWord();
    } else {
      word = (word ?? "") + char;
    }
  }

  endCommand();

  return { commands, end: index };
}

function findEnvironmentBypass(assignment: string) {
  const [name = "", value = ""] = assignment.split(/=(.*)/s);

  if (name === "LEFTHOOK_EXCLUDE") {
    return assignment;
  }

  return name === "LEFTHOOK" && (value === "0" || value === "false")
    ? assignment
    : undefined;
}

function findCommitBypass(args: readonly string[]) {
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];

    if (arg === "--") {
      return;
    }

    if (arg === "--no-verify") {
      return "git commit --no-verify";
    }

    if (arg.startsWith("--")) {
      if (longValueFlags.has(arg)) {
        index++;
      }

      continue;
    }

    if (!/^-[A-Za-z]+$/.test(arg)) {
      continue;
    }

    for (let position = 1; position < arg.length; position++) {
      const flag = arg[position];

      if (flag === "n") {
        return `git commit ${arg}`;
      }

      if (shortValueFlags.has(flag)) {
        if (position === arg.length - 1) {
          index++;
        }

        break;
      }
    }
  }
}

function findGitBypass(words: readonly string[]) {
  let index = 1;

  while (index < words.length && words[index].startsWith("-")) {
    const flag = words[index];

    if (flag === "-c" || flag.startsWith("-c")) {
      const value = flag === "-c" ? words[index + 1] : flag.slice(2);

      if (hooksPathPattern.test(value ?? "")) {
        return `git -c ${value}`;
      }
    }

    index += flag === "-c" || globalValueFlags.has(flag) ? 2 : 1;
  }

  const subcommand = words[index];
  const args = words.slice(index + 1);

  if (subcommand === "commit") {
    return findCommitBypass(args);
  }

  if (
    subcommand === "config" &&
    !args.some((arg) => arg.startsWith("--get")) &&
    args.some((arg) => hooksPathPattern.test(arg))
  ) {
    return "git config core.hooksPath";
  }
}

function findCommandBypass(words: readonly string[]) {
  let index = 0;

  while (index < words.length) {
    const word = words[index];

    if (word === "export" || word === "env") {
      index++;

      continue;
    }

    if (!assignmentPattern.test(word)) {
      break;
    }

    const bypass = findEnvironmentBypass(word);

    if (bypass !== undefined) {
      return bypass;
    }

    index++;
  }

  const rest = words.slice(index);

  if (rest[0]?.split("/").pop() === "git") {
    return findGitBypass(rest);
  }
}

export function findHookBypass(command: string) {
  for (const words of parse(command, 0).commands) {
    const bypass = findCommandBypass(words);

    if (bypass !== undefined) {
      return bypass;
    }
  }
}
