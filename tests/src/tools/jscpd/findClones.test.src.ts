import { describe, expect, test } from "vitest";

import { map, sort } from "@auaust/primitive-kit/arrays";

import { loadConfig } from "#project/config/operations/loadConfig";
import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createGitRepository } from "#tests/utils/createGitRepository";
import { findClones } from "#tools/jscpd/operations/findClones";

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

describe("findClones", { timeout: binaryTimeout }, () => {
  test("reports only the new clones of the changed files", async () => {
    const { project } = await createRepository();

    project.write("src/third.ts", createSource("third"));

    const clones = await findClones(await loadConfig(project.root), [
      "src/third.ts",
    ]);

    expect(clones).toHaveLength(1);

    expect(sort(map(clones[0]?.fragments ?? [], ({ file }) => file))).toEqual([
      expect.stringMatching(/^src\/(first|second)\.ts$/),
      "src/third.ts",
    ]);
  });

  test("reports clones in test files", async () => {
    const { project } = await createRepository();

    project.write("tests/third.test.ts", createSource("third"));

    const clones = await findClones(await loadConfig(project.root), [
      "tests/third.test.ts",
    ]);

    expect(clones).toHaveLength(1);
  });

  test("ignores fixtures", async () => {
    const { project } = await createRepository();

    project.write("tests/fixtures/third.ts", createSource("third"));

    expect(
      await findClones(await loadConfig(project.root), [
        "tests/fixtures/third.ts",
      ]),
    ).toEqual([]);
  });
});
