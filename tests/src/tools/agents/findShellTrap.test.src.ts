import { describe, expect, test } from "vitest";

import { findShellTrap } from "#tools/agents/operations/findShellTrap";

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
  ])("passes %s", (_case, command) => {
    expect(findShellTrap(command)).toBeUndefined();
  });
});
