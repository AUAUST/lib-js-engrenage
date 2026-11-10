import { afterEach, expect, test, vi } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { addAgentSkills } from "#tools/agents/operations/addAgentSkills";
import { readHookPayload } from "#tools/agents/operations/readHookPayload";
import { checkAgentStop } from "#workflows/gate/index";

import stop from "#bin/engrenage/agents/codex/hook/actions/stop";

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
  "worker_low",
  "worker_high",
  "debugger",
  "debugger_low",
  "debugger_high",
  "planner",
  "banker",
  "scratcher",
  "backlogger",
])(
  "stops the generated %s profile with its canonical gate policy",
  async (name) => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts": 'export default { agents: { preferred: ["codex"] } };',
    });

    const config = await loadConfig(project.root);

    await addAgentSkills(
      {
        filesystem: config.context.filesystem,
        agents: await config.resolve("agents"),
      },
      [
        "issue-implementation",
        "debugging",
        "issue-planning",
        "debt-harvesting",
        "scratchpad",
        "backlog-handling",
      ],
    );

    await config.context.filesystem.flush();

    vi.mocked(readHookPayload).mockResolvedValue({
      session_id: "session",
      agent_id: "agent",
      agent_type: name,
      cwd: project.root,
    });

    const write = vi.spyOn(process.stderr, "write").mockReturnValue(true);

    await stop();

    if (name.startsWith("worker") || name.startsWith("debugger")) {
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
