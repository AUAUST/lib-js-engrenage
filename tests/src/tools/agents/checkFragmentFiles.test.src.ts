import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { runSync } from "#project/sync/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";

async function check(
  body: string,
  files: Record<string, string> = {},
  config = `{ agents: { preferred: ["claude"] } }`,
) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "project",
      type: "module",
      repository: "github:acme/consumer",
    }),
    "engrenage.config.ts": `export default ${config};`,
    "src/index.ts": "",
    "notes.md": body,
    "AGENTS.md": [
      "# AGENTS.md",
      "",
      "<!-- @reference ./notes.md -->",
      "",
      body,
      "",
      "<!-- @end -->",
      "",
    ].join("\n"),
    ...files,
  });

  const loaded = await loadConfig(project.root, {
    reporter: createTestReporter(),
  });

  const [failure] = await runSync(loaded, { names: ["fragment-files"] });

  if (failure !== undefined) {
    throw failure.error;
  }
}

describe("checkFragmentFiles", () => {
  test("fails on a missing mentioned file, naming the reference and the path, and passes once it exists", async () => {
    const body = "Read `.ai/notes/plan.md` first.";

    const result = check(body);

    await expect(result).rejects.toThrow("./notes.md");

    await expect(result).rejects.toThrow(".ai/notes/plan.md");

    await expect(
      check(body, { ".ai/notes/plan.md": "" }),
    ).resolves.toBeUndefined();
  });

  test("passes on agent logs, placeholders, directories and fenced paths", async () => {
    await expect(
      check(
        [
          "Log to `.ai/friction.md`; draft `.ai/issues/<n>.draft.md` under `.claude/rules/`.",
          "",
          "```",
          ".ai/x/y.md",
          "```",
        ].join("\n"),
      ),
    ).resolves.toBeUndefined();
  });

  test("names the command installing a missing default rule of an active extension", async () => {
    await expect(
      check(
        "Read `.claude/rules/issue-drafts.md` first.",
        {},
        `{ agents: { preferred: ["claude"] }, github: { planning: true } }`,
      ),
    ).rejects.toThrow(
      ".claude/rules/issue-drafts.md, the default rule pnpm engrenage agents rules add issue-drafts installs",
    );
  });
});
