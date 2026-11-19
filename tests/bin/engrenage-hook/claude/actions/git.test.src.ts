import { afterEach, beforeEach, expect, test, vi } from "vitest";

import git from "#bin/engrenage-hook/claude/actions/git";

beforeEach(() => {
  vi.spyOn(process.stdout, "write").mockReturnValue(true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

test("denies a command that is not valid shell", async () => {
  await expect(
    git({
      tool_input: { command: `git commit -m "unterminated` },
    }),
  ).resolves.toBe(true);

  expect(process.stdout.write).toHaveBeenCalledWith(
    expect.stringContaining("the command is not valid shell: "),
  );
});

test("lets a valid command without a bypass through", async () => {
  await expect(
    git({
      tool_input: { command: `git commit -m "message"` },
    }),
  ).resolves.toBe(false);

  expect(process.stdout.write).not.toHaveBeenCalled();
});
