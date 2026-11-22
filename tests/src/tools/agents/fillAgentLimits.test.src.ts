import { expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { fillAgentLimits } from "#tools/metalbrain/operations/fillAgentLimits";

test("renders the limits of shipped agents although a skill holds its own marker", async () => {
  const project = createTemporaryProject({
    "package.json": '{"type":"module"}',
    "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] }, github: { planning: true } };',
  });

  const limits = await fillAgentLimits(await loadConfig(project.root));

  expect(limits).toContain("| `worker` | medium |");

  expect(limits).toContain("| `consultant` | medium | none | 100k context |");
});

test("renders only the named installed agents, in the order given", async () => {
  const project = createTemporaryProject({
    "package.json": '{"type":"module"}',
    "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] }, github: { planning: true } };',
  });

  const limits = await fillAgentLimits(
    await loadConfig(project.root),
    "merger",
    "worker",
  );

  const rows = limits.split("\n").slice(2);

  expect(rows).toHaveLength(2);

  expect(rows[0]).toContain("| `merger` |");

  expect(rows[1]).toContain("| `worker` |");
});

test("reports no agent when no name matches an installed agent", async () => {
  const project = createTemporaryProject({
    "package.json": '{"type":"module"}',
    "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] }, github: { planning: true } };',
  });

  expect(await fillAgentLimits(await loadConfig(project.root), "missing")).toBe(
    "No agent skills are installed.",
  );
});
