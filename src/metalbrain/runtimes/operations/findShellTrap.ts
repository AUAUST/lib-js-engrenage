import {
  parseShell,
  ShellSyntaxError,
  type ShellCommand,
  type ShellWord,
} from "#foundation/shell/index";

const pnpmRunners = new Set(["exec", "run"]);

// @debt pnpm's options taking a separate value are listed by hand, so one missing here reads its value as the binary
const pnpmValueOptions = new Set([
  "-C",
  "--dir",
  "-F",
  "--filter",
  "--filter-prod",
  "--loglevel",
  "--reporter",
  "--workspace-concurrency",
  "--test-pattern",
  "--changed-files-ignore-pattern",
]);

function readText(word: ShellWord | undefined) {
  return word?.kind === "literal" ? word.text : undefined;
}

function findWordTrap(word: ShellWord) {
  if (word.kind === "expansion" && word.source.startsWith("=")) {
    return `zsh expands the word \`${word.source}\`, starting with \`=\`, as a command path: quote it or reword it`;
  }
}

function findSedTrap(args: readonly ShellWord[]) {
  for (const [index, arg] of args.entries()) {
    const text = readText(arg);

    if (text === "--") {
      return;
    }

    if (text === undefined || !/^-[A-Za-z]*i$/.test(text)) {
      continue;
    }

    const next = args[index + 1];

    if (next === undefined || readText(next) !== "") {
      return "BSD `sed` reads the word after `-i` as the backup suffix: write `sed -i '' …`";
    }

    return;
  }
}

function skipPnpmOptions(args: readonly ShellWord[], start: number) {
  let index = start;
  let text = readText(args[index]);

  while (text?.startsWith("-") === true) {
    index += pnpmValueOptions.has(text) ? 2 : 1;
    text = readText(args[index]);
  }

  return index;
}

function readPnpmBinary(args: readonly ShellWord[]) {
  const first = skipPnpmOptions(args, 0);

  const start = pnpmRunners.has(readText(args[first]) ?? "")
    ? skipPnpmOptions(args, first + 1)
    : first;

  return { name: readText(args[start]), args: args.slice(start + 1) };
}

function isEslintFix({ name, args }: ReturnType<typeof readPnpmBinary>) {
  const [command, ...files] = args;

  return (
    name === "engrenage" &&
    readText(command) === "eslint:fix" &&
    files.every((arg) => {
      return readText(arg)?.startsWith("-");
    })
  );
}

function findMetalbrainTrap(args: readonly ShellWord[]) {
  for (const arg of args) {
    if (arg.kind !== "literal") {
      return `the shell expands \`${arg.source}\` before metalbrain reads it, running any command it holds: pass metalbrain text arguments in single quotes, writing \`'\\''\` for a single quote inside`;
    }
  }
}

function findCommandTrap({ words }: ShellCommand) {
  for (const word of words) {
    const trap = findWordTrap(word);

    if (trap !== undefined) {
      return trap;
    }
  }

  const [name, ...args] = words;
  const program = readText(name)?.split("/").pop();

  if (program === "timeout") {
    return "macOS has no `timeout`: use the tool's own timeout, such as the Bash tool's `timeout` parameter";
  }

  if (program === "sed") {
    return findSedTrap(args);
  }

  if (program === "metalbrain") {
    return findMetalbrainTrap(args);
  }

  if (program !== "pnpm") {
    return;
  }

  const binary = readPnpmBinary(args);

  if (binary.name === "metalbrain") {
    return findMetalbrainTrap(binary.args);
  }

  if (isEslintFix(binary)) {
    return "`pnpm engrenage eslint:fix` without files lints the whole project: name the files to lint";
  }
}

/**
 * Finds the first shell trap the Bash `command` falls into under zsh on macOS,
 * a `metalbrain` argument the shell expands included, returning its fix, or
 * `undefined` when it falls into none or is no valid Bash.
 */
export function findShellTrap(command: string) {
  let commands;

  try {
    commands = parseShell(command);
  } catch (error) {
    if (error instanceof ShellSyntaxError) {
      return;
    }

    throw error;
  }

  for (const shellCommand of commands) {
    const trap = findCommandTrap(shellCommand);

    if (trap !== undefined) {
      return trap;
    }
  }
}
