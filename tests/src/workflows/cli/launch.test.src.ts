import { execFileSync } from "node:child_process";

import { object, optional, parse, string } from "valibot";
import { afterEach, describe, expect, test, vi } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { launch } from "#workflows/cli/index";

const failure = new Error("src is broken");

const probe = `try {
  await import(process.argv[2]);
} catch (error) {
  const { name, message, stack, code, url } = error;
  console.log(JSON.stringify({ name, message, stack, code, url }));
}
`;

const loadFailureSchema = object({
  name: string(),
  message: string(),
  stack: string(),
  code: optional(string()),
  url: optional(string()),
});

function createStaleProject(barrel: string, files: Record<string, string>) {
  const project = createTemporaryProject({
    "package.json": '{ "type": "module", "imports": { "#src/*": "./src/*.ts" } }',
    "probe.mjs": probe,
    "src/d/utils/a.ts": "export const a = 1;\n",
    "src/d/index.ts": `// @barrel utils\n${barrel}// @end\n`,
    ...files,
  });

  mockCwd(project.root);

  function load(entry: string): Error {
    const output = execFileSync(
      process.execPath,
      [project.resolve("probe.mjs"), project.resolve(entry)],
      { encoding: "utf-8" },
    );

    const {
      name,
      ...properties
    } = parse(loadFailureSchema, JSON.parse(output));

    return Object.assign(
      name === "SyntaxError" ? new SyntaxError() : new Error(),
      properties,
    );
  }

  return { load };
}

function run(): Promise<never> {
  return Promise.reject(failure);
}

describe("launch", () => {
  afterEach(() => {
    process.exitCode = undefined;
    vi.restoreAllMocks();
  });

  test.each([
    {
      stale: "a barrel listing a deleted module prints the line to delete",
      barrel: 'export { a } from "#src/d/utils/a";\nexport { gone } from "#src/d/utils/gone";\n',
      files: {
        "src/main.ts": 'import { a } from "#src/d/index";\n\nvoid a;\n',
      },
      message: 'The barrel src/d/index.ts lists src/d/utils/gone.ts, which does not exist; the barrel is loaded before `engrenage sync` can regenerate it, so fix it by hand: delete `export { gone } from "#src/d/utils/gone";`',
    },
    {
      stale: "a barrel missing an export names the importer and the barrel",
      barrel: 'export { a } from "#src/d/utils/a";\n',
      files: {
        "src/d/utils/b.ts": "export const b = 1;\n",
        "src/main.ts": 'import { a, b } from "#src/d/index";\n\nvoid [a, b];\n',
      },
      message: 'src/main.ts imports `b` from "#src/d/index", but the barrel src/d/index.ts does not export it yet',
    },
  ])("a command failing on $stale", async ({ barrel, files, message }) => {
    const { load } = createStaleProject(barrel, files);

    const failed = load("src/main.ts");

    const error = vi.spyOn(process.stderr, "write").mockImplementation(() => {
      return true;
    });

    await launch(() => Promise.reject(failed));

    expect(process.exitCode).toBe(1);
    expect(String(error.mock.calls[0]?.[0])).toContain(message);
  });

  test("a command failing on a missing module a hand-written file imports rethrows", async () => {
    const {
      load,
    } = createStaleProject('export { a } from "#src/d/utils/a";\n', {
      "src/main.ts": 'import { gone } from "#src/d/utils/gone";\n\nvoid gone;\n',
    });

    const failed = load("src/main.ts");

    await expect(launch(() => Promise.reject(failed))).rejects.toBe(failed);
  });

  test("any other command rethrows", async () => {
    await expect(launch(run)).rejects.toBe(failure);
  });
});
