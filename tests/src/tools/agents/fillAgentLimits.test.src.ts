import { expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { fillAgentLimits } from "#tools/agents/operations/fillAgentLimits";

test("renders the limits of shipped agents although a skill holds its own marker", async () => {
  const project = createTemporaryProject({
    "package.json": '{"type":"module"}',
    "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] }, github: { planning: true } };',
  });

  const limits = await fillAgentLimits(await loadConfig(project.root));

  expect(limits).toContain("| `worker` | low |");

  expect(limits).toContain(
    "| `merger` | medium | none | 2× its starting context |",
  );
});
