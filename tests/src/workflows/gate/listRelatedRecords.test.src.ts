import { execFileSync } from "node:child_process";

import { describe, expect, test } from "vitest";
import { stringify } from "yaml";

import { loadConfig } from "#project/config/operations/loadConfig";
import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { runMessageGate } from "#workflows/gate/operations/runMessageGate";

const backlog = stringify({
  purpose: "Tools.",
  entries: [
    {
      id: "BL-0a0a0a",
      title: "Loader cache keeps stale config after an edit",
      why: "edits to the config file go unseen until restart.",
      created: "2026-11-20T00:00:00Z",
    },
    {
      id: "BL-0b0b0b",
      title: "Prettier plugin order breaks Liquid formatting",
      sites: ["src/format.ts:3"],
      created: "2026-11-20T00:00:00Z",
    },
  ],
});

async function checkCommit(message: string, staged: Record<string, string>) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ type: "module", name: "project" }),
    "engrenage.config.ts": "export default { runtime: { node: 24 } };",
    "src/index.ts": "",
    ".ai/backlog/tools.yml": backlog,
  });

  execFileSync("git", ["init", "--quiet"], {
    cwd: project.root,
    stdio: "pipe",
  });

  for (const [file, content] of Object.entries(staged)) {
    project.write(file, content);
  }

  execFileSync("git", ["add", "-A"], { cwd: project.root, stdio: "pipe" });

  project.write("COMMIT_EDITMSG", message);

  const config = await loadConfig(project.root);

  return runMessageGate(`${project.root}/COMMIT_EDITMSG`, {
    audience: "agents",
    config,
  });
}

describe("runMessageGate related records", { timeout: binaryTimeout }, () => {
  test("lists the entry a staged debt statement rewords", async () => {
    const { failures, warnings } = await checkCommit("feat: thing\n", {
      "src/load.ts": "// @debt loader cache keeps stale config after edits\nexport {};\n",
    });

    expect(failures).toEqual([]);

    expect(warnings).toEqual([
      {
        step: "related records",
        output: expect.stringMatching(
          /^Matching entries that might be related:\nBL-0a0a0a /u,
        ),
      },
    ]);

    expect(warnings[0]?.output).not.toContain("BL-0b0b0b");
  });

  test("gives no hint for a message sharing only stopwords with every entry", async () => {
    expect(
      await checkCommit("fix: the of and to\n", {
        "src/other.ts": "export {};\n",
      }),
    ).toEqual({ failures: [], warnings: [] });
  });
});
