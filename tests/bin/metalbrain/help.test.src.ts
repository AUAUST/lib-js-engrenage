import { expect, test, vi } from "vitest";

import { CommandUsageError, createProgram, runProgram } from "#nexus/cli/index";

import metalbrain from "#bin/metalbrain/index";

test("help of an unknown command in a group names it and the group", async () => {
  vi.spyOn(process.stderr, "write").mockImplementation(() => true);

  const onError = vi.fn();

  await runProgram(
    createProgram("metalbrain", metalbrain),
    ["node", "metalbrain", "help", "backlog", "nope"],
    { onError },
  );

  expect(onError).toHaveBeenCalledWith(
    new CommandUsageError("unknown command 'nope' in 'metalbrain backlog'"),
  );
});
