import { renameSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createGitRepository } from "#tests/utils/createGitRepository";
import { checkSuppressions } from "#tools/eslint/operations/checkSuppressions";

const file = "eslint-suppressions.json";

const manifest = JSON.stringify({
  type: "module",
  devDependencies: { eslint: "*" },
});

const source = "console.log(1);\nconsole.log(2);\n";

function suppress(count: number, path = "src/a.ts") {
  return JSON.stringify({
    [path]: {
      "no-console": { count },
    },
  });
}

describe("checkSuppressions", { timeout: binaryTimeout }, () => {
  test("refuses a raised count and accepts a lowered one", async () => {
    const { project } = await createGitRepository(
      { "package.json": manifest, [file]: suppress(2) },
      ["eslint"],
    );

    const config = await loadConfig(project.root);

    project.write(file, suppress(3));

    expect(await checkSuppressions(config, [file])).toEqual({
      ok: false,
      output: expect.stringContaining("src/a.ts no-console: 2 → 3"),
    });

    project.write(file, suppress(1));

    expect((await checkSuppressions(config, [file])).ok).toBe(true);
  });

  test("refuses a file the last commit lacks, and ignores it unchanged", async () => {
    const {
      project,
    } = await createGitRepository({ "package.json": manifest }, ["eslint"]);

    const config = await loadConfig(project.root);

    project.write(file, suppress(1));

    expect((await checkSuppressions(config, [file])).ok).toBe(false);

    expect((await checkSuppressions(config, ["src/a.ts"])).ok).toBe(true);
  });

  test("accepts a moved file's suppressions, and refuses them raised", async () => {
    const { project, git } = await createGitRepository(
      {
        "package.json": manifest,
        "src/a.ts": source,
        [file]: suppress(2),
      },
      ["eslint"],
    );

    const config = await loadConfig(project.root);

    git("mv", "src/a.ts", "src/b.ts");

    project.write(file, suppress(2, "src/b.ts"));

    expect((await checkSuppressions(config, [file])).ok).toBe(true);

    project.write(file, suppress(3, "src/b.ts"));

    expect(await checkSuppressions(config, [file])).toEqual({
      ok: false,
      output: expect.stringContaining("src/b.ts no-console: 2 → 3"),
    });
  });

  test("accepts the suppressions of a file moved without staging", async () => {
    const { project } = await createGitRepository(
      {
        "package.json": manifest,
        "src/a.ts": source,
        [file]: suppress(2),
      },
      ["eslint"],
    );

    const config = await loadConfig(project.root);

    renameSync(project.resolve("src/a.ts"), project.resolve("src/b.ts"));

    project.write(file, suppress(2, "src/b.ts"));

    expect((await checkSuppressions(config, [file])).ok).toBe(true);
  });
});
