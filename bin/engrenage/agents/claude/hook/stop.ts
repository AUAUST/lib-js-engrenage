import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { object, string } from "valibot";

import { readTextFile, resolveWithin } from "#foundation/filesystem/index";
import { cacheSection } from "#project/config/index";
import { readHookPayload } from "#tools/agents/operations/readHookPayload";
import { hashTree } from "#tools/git/index";
import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { runGate } from "#workflows/gate/index";
import { formatGateFailure } from "#workflows/gate/utils/formatGateFailure";
import { loadConfig } from "#workflows/registry/operations/loadConfig";

const payloadSchema = object({
  agent_id: string(),
  cwd: string(),
});

export const stop = defineCommand((command) => {
  return command.action(async () => {
    const { agent_id: agent, cwd } = await readHookPayload(
      payloadSchema,
      "Claude Code",
    );

    const config = await loadConfig(cwd);

    const { failures } = await runGate(config, { mode: "worktree" });

    if (failures.length === 0) {
      return;
    }

    // @debt the stop-marker logic lives in `bin` instead of the gate workflow, and its per-agent markers are never removed.
    const { root } = config.context;
    const cache = await config.resolve(cacheSection);

    const marker = resolveWithin(root, cache.for("gate"), "stops", agent);
    const tree = await hashTree(root, "worktree");

    const stopped = await readTextFile(marker);

    if (stopped?.trim() === tree) {
      return;
    }

    await mkdir(dirname(marker), { recursive: true });
    await writeFile(marker, `${tree}\n`);

    process.stderr.write(
      `${failures.map(formatGateFailure).join("\n")}\nFix them and stop again. If you must stop now, list these failures in your report and stop again: the commit gate still refuses this tree.\n`,
    );

    process.exitCode = 2;
  });
});
