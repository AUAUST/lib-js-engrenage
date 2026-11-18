import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { runSync } from "#project/sync/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";

function words(count: number) {
  return Array.from({ length: count }, () => "word").join(" ");
}

async function check(cell: string) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ name: "project", type: "module" }),
    "engrenage.config.ts": `export default { agents: { preferred: ["claude"] } };`,
    "src/index.ts": "",
    ".claude/rules/x.md": ["# X", "", "| A |", "| - |", `| ${cell} |`, ""].join(
      "\n",
    ),
  });

  const loaded = await loadConfig(project.root, {
    reporter: createTestReporter(),
  });

  const [failure] = await runSync(loaded, { names: ["table-cells"] });

  if (failure !== undefined) {
    throw failure.error;
  }
}

describe("checkTableCells", () => {
  test("fails on a cell of 26 words, naming its file, line and count", async () => {
    const result = check(words(26));

    await expect(result).rejects.toThrow(".claude/rules/x.md:5");

    await expect(result).rejects.toThrow("holds 26 words");
  });

  test("passes on a cell of 25 words plus a code span", async () => {
    await expect(
      check(`${words(25)} \`not counted\``),
    ).resolves.toBeUndefined();
  });
});
