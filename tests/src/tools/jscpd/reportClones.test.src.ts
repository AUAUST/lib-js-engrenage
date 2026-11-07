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

    const report = await reportClones(await loadConfig(project.root), [
      "src/third.ts",
    ]);

    expect(report).toMatch(/(first|second)\.ts:1-15 ~ third\.ts:1-15/);
    expect(report).not.toMatch(/first\.ts:1-15 ~ second\.ts:1-15/);
  });

  test("reports clones in test files", async () => {
    const { project } = await createRepository();

    project.write("tests/third.test.ts", createSource("third"));

    const report = await reportClones(await loadConfig(project.root), [
      "tests/third.test.ts",
    ]);

    expect(report).toMatch(/third\.test\.ts:1-15/);
  });

  test("ignores fixtures", async () => {
    const { project } = await createRepository();

    project.write("tests/fixtures/third.ts", createSource("third"));

    expect(
      await reportClones(await loadConfig(project.root), [
        "tests/fixtures/third.ts",
      ]),
    ).toBeUndefined();
  });
});
