import { expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { runSync } from "#project/sync/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { fillBlocks } from "#tests/utils/fillBlocks";
import { linkSourcePackage } from "#tests/utils/linkSourcePackage";

const compass = "Acme ships widgets.";

async function sync(agents: string) {
  const project = createTemporaryProject({
    "package.json": '{"type":"module"}',
    "engrenage.config.ts": `export default { agents: ${agents} };`,
    "src/index.ts": "",
    "AGENTS.md": "# AGENTS.md\n\n<!-- @reference @auaust/engrenage/metalbrain/sections/compass.md -->\n<!-- @end -->\n",
  });

  linkSourcePackage(project.resolve("node_modules/@auaust/engrenage"));

  const reporter = createTestReporter();

  const loaded = await loadConfig(project.root, { reporter });

  await runSync(loaded, { names: ["agents"] });

  const hints = reporter.messages.filter(({ text }) => {
    return text.includes("agents.compass");
  });

  return { agentsFile: await fillBlocks(loaded, "AGENTS.md"), hints };
}

test("renders the project's Compass into AGENTS.md through the compass section", async () => {
  const { agentsFile, hints } = await sync(
    `{ preferred: ["claude"], compass: ${JSON.stringify(compass)} }`,
  );

  expect(agentsFile).toContain(`\n${compass}\n`);

  expect(agentsFile).not.toContain("agents.compass");

  expect(hints).toEqual([]);
});

test("asks agents to draft a missing Compass and reports it, naming the option", async () => {
  const { agentsFile, hints } = await sync('{ preferred: ["claude"] }');

  expect(agentsFile).toContain("`agents.compass`");

  expect(hints.map(({ level }) => level)).toEqual(["info"]);
});
