import { describe, expect, test } from "vitest";

import { findHookBypass } from "#tools/git/utils/findHookBypass";

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
