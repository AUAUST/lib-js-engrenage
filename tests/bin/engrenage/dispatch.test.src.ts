import { afterEach, expect, test, vi } from "vitest";

import { dispatch } from "#bin/engrenage/agents/claude/hook/dispatch";
import { runCommand } from "#tests/utils/runCommand";

vi.mock("#tools/agents/operations/readHookPayload", () => {
  return {
    readHookPayload: vi.fn(() =>
      Promise.resolve({
        tool_input: { subagent_type: "worker", prompt: "implement it" },
      }),
    ),
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

test("denies a worker prompt without the Issue line", async () => {
  const write = vi.spyOn(process.stdout, "write").mockReturnValue(true);

  await runCommand(dispatch);

  expect(write).toHaveBeenCalledWith(
    expect.stringContaining("brief a worker with `Issue: <owner>/<repo>#<n>`"),
  );
});
