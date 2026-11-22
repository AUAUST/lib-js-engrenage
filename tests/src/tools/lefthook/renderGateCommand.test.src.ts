import { describe, expect, test } from "vitest";

import { agentShellVariables } from "#metalbrain/runtimes/constants";
import { gateHooks } from "#tools/lefthook/constants";
import { listGateVariables } from "#tools/lefthook/utils/listGateVariables";
import { renderGateCommand } from "#tools/lefthook/utils/renderGateCommand";

const gate = { commands: [], hook: undefined };

describe("renderGateCommand", () => {
  test("gives agent and human commands complementary conditions", () => {
    expect(
      renderGateCommand(
        listGateVariables({ preferred: ["claude"], gate }),
        gateHooks["pre-commit"],
      ),
    ).toEqual({
      "engrenage": {
        only: [{ run: 'test -n "$CLAUDECODE"' }],
        run: "pnpm --silent --config.verify-deps-before-run=false engrenage gate --staged",
      },
      "engrenage-local": {
        skip: [{ run: 'test -n "$CLAUDECODE"' }],
        run: "pnpm --silent --config.verify-deps-before-run=false engrenage gate --staged --everyone",
      },
    });
  });

  test("joins preferred agent variables in both conditions", () => {
    expect(listGateVariables({ preferred: ["claude"], gate })).toEqual([
      agentShellVariables.claude,
    ]);

    const commands = renderGateCommand(["A", "B"], gateHooks["pre-commit"]);
    const condition = [{ run: 'test -n "$A" || test -n "$B"' }];

    expect(commands.engrenage?.only).toEqual(condition);
    expect(commands["engrenage-local"]?.skip).toEqual(condition);
  });

  test("renders only an unconditional everyone command without agent variables", () => {
    expect(renderGateCommand([], gateHooks["pre-commit"])).toEqual({
      "engrenage-local": {
        run: "pnpm --silent --config.verify-deps-before-run=false engrenage gate --staged --everyone",
      },
    });
  });
});
