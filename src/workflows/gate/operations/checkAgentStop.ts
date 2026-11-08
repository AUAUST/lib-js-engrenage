import { createHash } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { readTextFile, resolveWithin } from "#foundation/filesystem/index";
import { cacheSection } from "#project/cache/index";
import { hashTree } from "#tools/git/index";
import { runGate } from "#workflows/gate/operations/runGate";
import { formatGateEntry } from "#workflows/gate/utils/formatGateEntry";
import type { LoadedConfig } from "#project/config/index";

export async function checkAgentStop(
  config: LoadedConfig,
  identity: { runtime: string; session: string; agent: string },
): Promise<string | undefined> {
  const { failures } = await runGate(config, { mode: "worktree" });

  const { root } = config.context;

  const cache = await config.resolve(cacheSection);

  const key = createHash("sha256")
    .update(
      JSON.stringify([identity.runtime, identity.session, identity.agent]),
    )
    .digest("hex");

  const marker = resolveWithin(root, cache.for("gate"), "stops", key);

  if (failures.length === 0) {
    return void (await rm(marker, { force: true }));
  }

  // @debt the failing-tree marker hashes the worktree after the gate released its lock, so another gate's fixes can land in between
  const tree = await hashTree(root, { mode: "worktree" });

  const stopped = await readTextFile(marker);

  if (stopped?.trim() === tree) {
    return;
  }

  await mkdir(dirname(marker), { recursive: true });

  await writeFile(marker, `${tree}\n`);

  return `${failures.map(formatGateEntry).join("\n")}\nFix them and stop again. If you must stop now, list these failures in your report and stop again: the commit gate still refuses this tree.\n`;
}
