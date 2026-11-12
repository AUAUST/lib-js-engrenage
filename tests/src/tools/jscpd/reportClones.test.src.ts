import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createGitRepository } from "#tests/utils/createGitRepository";
import { reportClones } from "#tools/jscpd/operations/reportClones";

function createSource(name: string): string {
  return `export function ${name}(values: number[]): number {
  let total = 0;

  for (const value of values) {
    if (value > 10) {
      total += value * 2;
    } else {
      total -= value / 3;
    }
  }

  const result = total + values.length;

  return result > 100 ? result - 100 : result;
}
`;
}

function createRepository() {
  return createGitRepository(
    {
      "package.json": JSON.stringify({
        name: "project",
        type: "module",
        devDependencies: { jscpd: "*" },
      }),
      "engrenage.config.ts": "export default {};\n",
      "src/first.ts": createSource("first"),
      "src/second.ts": createSource("second"),
      "src/third.ts": "export const third = 1;\n",
      "tests/third.test.ts": "export const test = 1;\n",
      "tests/fixtures/third.ts": "export const fixture = 1;\n",
    },
    ["jscpd"],
  );
}

describe("reportClones", { timeout: binaryTimeout }, () => {
  test("reports only the new clones of the changed files", async () => {
    const { project } = await createRepository();

    project.write("src/third.ts", createSource("third"));

    const report = await reportClones(await loadConfig(project.root), {
      files: ["src/third.ts"],
    });

    expect(report).toMatch(/(first|second)\.ts:1-15 ~ src\/third\.ts:1-15/);

    expect(report).not.toMatch(/first\.ts:1-15 ~ second\.ts:1-15/);
  });

  test("reports clones in test files", async () => {
    const { project } = await createRepository();

    project.write("tests/third.test.ts", createSource("third"));

    const report = await reportClones(await loadConfig(project.root), {
      files: ["tests/third.test.ts"],
    });

    expect(report).toMatch(/third\.test\.ts:1-15/);
  });

  test("ignores fixtures", async () => {
    const { project } = await createRepository();

    project.write("tests/fixtures/third.ts", createSource("third"));

    expect(
      await reportClones(await loadConfig(project.root), {
        files: ["tests/fixtures/third.ts"],
      }),
    ).toBeUndefined();
  });

  test("reports only the gate's files among the new clones", async () => {
    const { project } = await createRepository();

    project.write("src/third.ts", createSource("third"));

    project.write("tests/third.test.ts", createSource("test"));

    const report = await reportClones(await loadConfig(project.root), {
      files: ["src/third.ts"],
    });

    expect(report).toMatch(/third\.ts:1-15/);

    expect(report).not.toMatch(/third\.test\.ts/);
  });

  test("reports the clones added since a ref", async () => {
    const { project, commit } = await createRepository();

    project.write("src/third.ts", createSource("third"));

    commit("third");

    const report = await reportClones(await loadConfig(project.root), {
      since: "HEAD~1",
    });

    expect(report).toMatch(/third\.ts:1-15/);

    expect(report).not.toMatch(/first\.ts:1-15 ~ second\.ts:1-15/);
  });

  test("reports nothing since a ref when no file is scanned", async () => {
    const { project, commit } = await createGitRepository(
      {
        "package.json": JSON.stringify({
          name: "project",
          type: "module",
          devDependencies: { jscpd: "*" },
        }),
        "engrenage.config.ts": "export default {};\n",
        "notes/first.ts": createSource("first"),
      },
      ["jscpd"],
    );

    project.write("notes/second.ts", createSource("second"));

    commit("second");

    expect(
      await reportClones(await loadConfig(project.root), { since: "HEAD~1" }),
    ).toBeUndefined();
  });
});
