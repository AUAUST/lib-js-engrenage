import { describe, expect, test } from "vitest";

import { findShellTrap } from "#metalbrain/runtimes/operations/findShellTrap";

describe("findShellTrap", () => {
  test.each([
    ["sed -i with a script after it", "sed -i 's/a/b/' x.md", "suffix"],
    ["sed -i with quotes glued to it", "sed -Ei'' 's/a/b/' x.md", "suffix"],
    ["timeout", "timeout 5 pnpm test", "timeout"],
    ["a word starting with =", "[ a == b ]", "command path"],
    ["eslint:fix without files", "pnpm engrenage eslint:fix", "whole project"],
    [
      "eslint:fix with flags only",
      "pnpm exec engrenage eslint:fix --cache",
      "whole project",
    ],
    [
      "backticks in a metalbrain argument",
      "metalbrain friction add --subject \"`git ls-files`\" --tried 'x' --stopped 'y'",
      "single quotes",
    ],
    [
      "a parameter in a metalbrain argument",
      'metalbrain backlog search "$VAR"',
      "single quotes",
    ],
    [
      "a brace expansion in a metalbrain argument",
      "pnpm exec metalbrain backlog show {a,b}",
      "single quotes",
    ],
    [
      "a substitution after a pnpm option",
      'pnpm -s metalbrain friction add --subject "$(x)"',
      "single quotes",
    ],
    [
      "a substitution after pnpm options around exec",
      'pnpm --silent -C . exec --shell-mode metalbrain backlog search "$(x)"',
      "single quotes",
    ],
  ])("refuses %s", (_case, command, fix) => {
    expect(findShellTrap(command)).toContain(fix);
  });

  test.each([
    ["an unquoted glob", "ls src/*.ts"],
    ["the test command", "[ -f x ] && echo ok"],
    ["a glob beside an expansion", 'eslint "$dir"/a?.ts'],
    ["sed -i with the empty suffix", "sed -i '' 's/a/b/' x.md"],
    ["timeout as an argument", "pnpm vitest --timeout 5"],
    ["a lone =", "[ a = b ]"],
    ["= inside a word", "git log --format=%H"],
    ["eslint:fix with files", "pnpm engrenage eslint:fix src/a.ts"],
    ["zsh-only syntax", "echo ${(f)x}"],
    [
      "a single-quoted metalbrain argument",
      "metalbrain friction search '$(rm -rf x)'",
    ],
    [
      "an ANSI-C quoted metalbrain argument",
      "pnpm metalbrain friction search $'it\\'s `x`'",
    ],
    [
      "a loop word in a metalbrain argument",
      'for n in a b; do pnpm metalbrain backlog show "$n"; done',
    ],
    ["an expansion outside metalbrain", 'gh issue view "$n"'],
  ])("passes %s", (_case, command) => {
    expect(findShellTrap(command)).toBeUndefined();
  });
});
