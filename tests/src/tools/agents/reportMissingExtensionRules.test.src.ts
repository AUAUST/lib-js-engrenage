import { expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { runSync } from "#project/sync/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";

const rules = "@auaust/engrenage/metalbrain/rules";

async function sync(files: Record<string, string> = {}) {
  const project = createTemporaryProject({
    "package.json": '{"type":"module","repository":"github:acme/consumer"}',
    "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] }, github: { planning: true } };',
    "src/index.ts": "",
    ...files,
  });

  const reporter = createTestReporter();

  const loaded = await loadConfig(project.root, { reporter });

  await runSync(loaded, { names: ["agents"] });

  return reporter.messages.filter(({ text }) => {
    return text.includes("default agent rules");
  });
}

test("hints at the missing default rules of active extensions after sync, naming the command installing them", async () => {
  const [hint, ...rest] = await sync();

  expect(rest).toEqual([]);

  expect(hint?.level).toBe("info");

  expect(hint?.text).toContain("github, issue-drafts");

  expect(hint?.text).toContain("pnpm engrenage agents rules add <name>");
});

test("stays silent once the project holds every default rule of its active extensions", async () => {
  expect(
    await sync({
      ".claude/rules/github.md": `<!-- @reference ${rules}/github.md -->\n<!-- @end -->\n`,
      ".claude/rules/issue-drafts.md": `<!-- @reference ${rules}/issue-drafts.md -->\n<!-- @end -->\n`,
    }),
  ).toEqual([]);
});
