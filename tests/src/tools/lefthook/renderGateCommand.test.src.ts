import { describe, expect, test } from "vitest";

import { agentShellVariables } from "#tools/agents/constants";
import { listGateVariables } from "#tools/lefthook/utils/listGateVariables";
import { renderGateCommand } from "#tools/lefthook/utils/renderGateCommand";

const gate = { commands: [], hook: undefined };

describe("renderGateCommand", () => {
  test("gives agent and human commands complementary conditions", () => {
    expect(
      renderGateCommand(listGateVariables({ preferred: ["claude"], gate })),
    ).toEqual({
      "engrenage": {
        only: [{ run: 'test -n "$CLAUDECODE"' }],
        run: "pnpm --silent engrenage gate --staged",
      },
      "engrenage-local": {
        skip: [{ run: 'test -n "$CLAUDECODE"' }],
        run: "pnpm --silent engrenage gate --staged --everyone",
      },
    });
  });

  test("joins preferred agent variables in both conditions", () => {
    expect(listGateVariables({ preferred: ["claude", "codex"], gate })).toEqual(
      [agentShellVariables.claude],
    );

    const commands = renderGateCommand(["A", "B"]);
    const condition = [{ run: 'test -n "$A" || test -n "$B"' }];

    expect(commands.engrenage?.only).toEqual(condition);
    expect(commands["engrenage-local"]?.skip).toEqual(condition);
  });

  test("renders only an unconditional everyone command without agent variables", () => {
    expect(renderGateCommand([])).toEqual({
      "engrenage-local": {
        run: "pnpm --silent engrenage gate --staged --everyone",
      },
    });
  });
});
