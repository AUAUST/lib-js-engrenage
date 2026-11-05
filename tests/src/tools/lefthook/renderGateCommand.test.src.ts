import { describe, expect, test } from "vitest";

import { agentShellVariables } from "#tools/agents/constants";
import { listGateVariables } from "#tools/lefthook/utils/listGateVariables";
import { renderGateCommand } from "#tools/lefthook/utils/renderGateCommand";

const gate = { commands: [], hook: undefined };

describe("renderGateCommand", () => {
  test("conditions the gate on the Claude Code shell variable", () => {
    expect(
      renderGateCommand(listGateVariables({ preferred: ["claude"], gate })),
    ).toEqual({
      only: [{ run: 'test -n "$CLAUDECODE"' }],
      run: "pnpm --silent engrenage gate --staged",
    });
  });

  test("joins the variables of the preferred agents, Codex declaring none", () => {
    expect(listGateVariables({ preferred: ["claude", "codex"], gate })).toEqual(
      [agentShellVariables.claude],
    );

    expect(renderGateCommand(["A", "B"]).only).toEqual([
      { run: 'test -n "$A" || test -n "$B"' },
    ]);
  });
});
