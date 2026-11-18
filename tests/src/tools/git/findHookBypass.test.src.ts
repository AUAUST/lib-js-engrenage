import { describe, expect, test } from "vitest";

import { ShellSyntaxError } from "#foundation/shell/errors/ShellSyntaxError";
import { findHookBypass } from "#tools/git/operations/findHookBypass";

describe("findHookBypass", () => {
  test.each([
    'git commit -nm "x"',
    "git -C . commit --no-verify",
    "LEFTHOOK=0 git commit -m x",
    "npm test && git -c core.hooksPath=/dev/null commit -m x",
    "echo $(git commit -n)",
    "git config --global core.hooksPath /dev/null",
  ])("reports %s", (command) => {
    expect(findHookBypass(command)).toBeDefined();
  });

  test.each([
    'git commit -m "-n flag"',
    "git commit -m -n",
    "git log -n 3",
    "git config --get core.hooksPath",
  ])("passes %s", (command) => {
    expect(findHookBypass(command)).toBeUndefined();
  });
});

describe("findHookBypass shell constructs", () => {
  test.each([
    "echo $(git commit --no-verify)",
    "echo `git commit --no-verify`",
    "true && LEFTHOOK=0 git commit",
    "git commit --no-verify -F - <<'EOF'\nx\nEOF",
  ])("reports %s", (command) => {
    expect(findHookBypass(command)).toBeDefined();
  });

  test("keeps a quoted `;` inside its argument", () => {
    expect(findHookBypass("git commit -m 'a; git commit -n'")).toBeUndefined();
  });

  test("throws on an unterminated quote after a valid first line", () => {
    expect(() => findHookBypass("git commit -m x\necho 'y")).toThrow(
      ShellSyntaxError,
    );
  });
});
