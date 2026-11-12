import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { gateIdentity } from "#tests/constants";
import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createGateRepository } from "#tests/utils/createGateRepository";
import { checkAgentStop } from "#workflows/gate/operations/checkAgentStop";
import { runGate } from "#workflows/gate/operations/runGate";

describe("runGate", { timeout: binaryTimeout }, () => {
  test("keeps failing-stop escapes separate for runtime, session and agent", async () => {
    const { project } = await createGateRepository();

    project.write("src/index.ts", 'export const value: number = "text";\n');

    const config = await loadConfig(project.root);

    expect(await checkAgentStop(config, gateIdentity)).toContain("typecheck");

    expect(await checkAgentStop(config, gateIdentity)).toBeUndefined();

    expect(
      await checkAgentStop(config, {
        ...gateIdentity,
        runtime: "claude",
      }),
    ).toContain("typecheck");

    expect(
      await checkAgentStop(config, {
        ...gateIdentity,
        session: "another",
      }),
    ).toContain("typecheck");

    expect(
      await checkAgentStop(config, {
        ...gateIdentity,
        agent: "another",
      }),
    ).toContain("typecheck");
  });

  test("returns from the stamp on a tree that already passed", async () => {
    const { project, git } = await createGateRepository();

    project.write("src/index.ts", "export const value: number = 2;\n");

    git("add", "src/index.ts");

    const config = await loadConfig(project.root);

    const passed = { failures: [], warnings: [] };

    expect(await runGate(config, { mode: "staged" })).toEqual(passed);
    expect(await runGate(config, { mode: "staged" })).toEqual(passed);

    expect(project.read(".runs")).toBe("run\n");
  });

  test("checks again a commit whose content the stop did not pass", async () => {
    const { project, git } = await createGateRepository();

    project.write("src/index.ts", "export const value: number = 2;\n");

    const config = await loadConfig(project.root);

    expect(await checkAgentStop(config, gateIdentity)).toBeUndefined();

    project.write("src/index.ts", "export const value: number = 3;\n");

    git("add", "src/index.ts");

    expect(await runGate(config, { mode: "staged" })).toEqual({
      failures: [],
      warnings: [],
    });

    expect(project.read(".runs")).toBe("run\nrun\n");
  });
});
