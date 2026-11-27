import { expect, test, vi } from "vitest";

import { CommandUsageError, program, runProgram } from "#nexus/cli/index";

import metalbrain from "#bin/metalbrain/index";

test("help of an unknown command in a group names it and the group", async () => {
  vi.spyOn(process.stderr, "write").mockImplementation(() => true);

  const onError = vi.fn();

  await runProgram(
    program({ root: metalbrain }),
    ["node", "metalbrain", "help", "backlog", "nope"],
    { onError },
  );

  expect(onError).toHaveBeenCalledWith(
    new CommandUsageError("unknown command 'nope' in 'metalbrain backlog'"),
    expect.anything(),
  );
});
