import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { readHookPayload } from "#tools/agents/operations/readHookPayload";

import git from "#bin/engrenage/agents/claude/hook/actions/git";

vi.mock("#tools/agents/operations/readHookPayload", () => {
  return {
    readHookPayload: vi.fn(),
  };
});

beforeEach(() => {
  vi.spyOn(process.stdout, "write").mockReturnValue(true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

test("denies a command that is not valid shell", async () => {
  vi.mocked(readHookPayload).mockResolvedValue({
    tool_input: { command: `git commit -m "unterminated` },
  });

  await git();

  expect(process.stdout.write).toHaveBeenCalledWith(
    expect.stringContaining("the command is not valid shell: "),
  );
});

test("lets a valid command without a bypass through", async () => {
  vi.mocked(readHookPayload).mockResolvedValue({
    tool_input: { command: `git commit -m "message"` },
  });

  await git();

  expect(process.stdout.write).not.toHaveBeenCalled();
});
