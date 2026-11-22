import {
  parseShell,
  ShellSyntaxError,
  type ShellCommand,
  type ShellWord,
} from "#foundation/shell/index";

const engrenageRunners = new Set(["exec", "run"]);

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

function isEslintFix(args: readonly ShellWord[]) {
  const start = engrenageRunners.has(readText(args[0]) ?? "") ? 1 : 0;

  return (
    readText(args[start]) === "engrenage" &&
    readText(args[start + 1]) === "eslint:fix" &&
    args.slice(start + 2).every((arg) => {
      return readText(arg)?.startsWith("-");
    })
  );
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

  if (program === "pnpm" && isEslintFix(args)) {
    return "`pnpm engrenage eslint:fix` without files lints the whole project: name the files to lint";
  }
}

/**
 * Finds the first shell trap the Bash `command` falls into under zsh on macOS,
 * returning its fix, or `undefined` when it falls into none or is no valid Bash.
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
