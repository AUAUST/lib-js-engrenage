import { expect, test } from "vitest";

import { guardClaudeGit } from "#tools/metalbrain/operations/guardClaudeGit";

function guard(command: string) {
  return guardClaudeGit({
    tool_input: { command },
  });
}

test("denies a command that is not valid shell", () => {
  expect(guard(`git commit -m "unterminated`)).toEqual({
    decision: "deny",
    reason: expect.stringContaining("the command is not valid shell: "),
  });
});

test("denies zsh-only syntax, asking for POSIX sh", () => {
  expect(guard("git add ${(f)files}")).toEqual({
    decision: "deny",
    reason: expect.stringContaining("are a zsh feature: write POSIX sh"),
  });
});

test("lets a valid command without a bypass through", () => {
  expect(guard(`git commit -m "message"`)).toBeUndefined();
});
