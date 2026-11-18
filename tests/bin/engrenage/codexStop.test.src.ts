import { afterEach, expect, test, vi } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { runDefinition } from "#tests/utils/runDefinition";
import { addAgentSkills } from "#tools/agents/operations/addAgentSkills";
import { createAgentFillers } from "#tools/agents/operations/createAgentFillers";
import { listActiveExtensions } from "#tools/agents/operations/listActiveExtensions";
import { readHookPayload } from "#tools/agents/operations/readHookPayload";
import { checkAgentStop } from "#workflows/gate/index";

import stop from "#bin/engrenage/agents/codex/hook/stop";

vi.mock("#tools/agents/operations/readHookPayload", () => {
  return {
    readHookPayload: vi.fn(),
  };
});

vi.mock("#workflows/gate/index", () => {
  return {
    checkAgentStop: vi.fn(() => {
      return Promise.resolve("failing command\nactual output\n");
    }),
  };
});

afterEach(() => {
  process.exitCode = undefined;
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

test.each([
  "worker",
  "worker_medium",
  "debugger",
  "debugger_low",
  "debugger_high",
  "planner",
  "curator",
])(
  "stops the generated %s profile with its canonical gate policy",
  async (name) => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module","repository":"github:acme/consumer"}',
      "engrenage.config.ts": 'export default { agents: { preferred: ["codex"] } };',
    });

    const config = await loadConfig(project.root);

    await addAgentSkills(
      {
        filesystem: config.context.filesystem,
        agents: await config.resolve("agents"),
        extensions: await listActiveExtensions(config),
        fillers: await createAgentFillers(config),
      },
      ["issue-implementation", "debugging", "planning", "curation"],
    );

    await config.context.filesystem.flush();

    vi.mocked(readHookPayload).mockResolvedValue({
      session_id: "session",
      agent_id: "agent",
      agent_type: name,
      cwd: project.root,
    });

    const write = vi.spyOn(process.stderr, "write").mockReturnValue(true);

    await runDefinition(stop);

    if (name !== "planner") {
      expect(checkAgentStop).toHaveBeenCalledWith(expect.anything(), {
        runtime: "codex",
        session: "session",
        agent: "agent",
      });

      expect(write).toHaveBeenCalledWith("failing command\nactual output\n");

      expect(process.exitCode).toBe(2);
    } else {
      expect(checkAgentStop).not.toHaveBeenCalled();
      expect(write).not.toHaveBeenCalled();
    }
  },
);
