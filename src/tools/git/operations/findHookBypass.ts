import {
  parseShell,
  type ShellCommand,
  type ShellWord,
} from "#foundation/shell/index";

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

function readText(word: ShellWord) {
  return word.kind === "literal" ? word.text : word.source;
}

function findCommandBypass({ assignments, words: shellWords }: ShellCommand) {
  for (const { name, value } of assignments) {
    const bypass = findEnvironmentBypass(`${name}=${readText(value)}`);

    if (bypass !== undefined) {
      return bypass;
    }
  }

  const words = shellWords.map(readText);

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

// @debt commands run through a wrapper (`bash -c`, `sh -c`, `eval`, `command`, `sudo`, `xargs`, `exec`) are not followed, so `bash -c 'git commit -n'` passes; `parseShell` could parse the literal script of `-c` and `eval`
export function findHookBypass(command: string) {
  for (const shellCommand of parseShell(command)) {
    const bypass = findCommandBypass(shellCommand);

    if (bypass !== undefined) {
      return bypass;
    }
  }
}
