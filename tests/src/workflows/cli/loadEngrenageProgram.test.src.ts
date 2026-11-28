import { execFile, execFileSync } from "node:child_process";
import { symlinkSync } from "node:fs";
import { promisify } from "node:util";

import { object, optional, parse, string } from "valibot";
import { afterEach, describe, expect, test, vi } from "vitest";

import { createBuildSources } from "#project/build/operations/createBuildSources";
import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { loadEngrenageProgram } from "#workflows/cli/index";

const execute = promisify(execFile);

const surfaces = {
  nexus: import.meta.resolve("#nexus/cli/index"),
  workflows: import.meta.resolve("#workflows/cli/index"),
};

const store = "node_modules/.pnpm/fixture/node_modules/fixture";
const installed = "../.pnpm/fixture/node_modules/fixture";

const manifest = JSON.stringify({
  name: "fixture",
  type: "module",
  exports: { ".": "./dist/index.mjs" },
});

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

function createExecutable(copy: string) {
  return `import { command } from ${JSON.stringify(surfaces.nexus)};
import { loadEngrenageProgram } from ${JSON.stringify(surfaces.workflows)};

await loadEngrenageProgram("cli", import.meta.url, async () => {
  console.log(${JSON.stringify(copy)});

  return { root: command({ name: "cli", action: () => Promise.resolve(() => {}) }) };
});
`;
}

// @debt builds the linked-checkout fixture `prepareLinkedRun.test.src.ts` builds too, which jscpd reports as a clone
async function runInstalled(linked: boolean) {
  const checkout = createTemporaryProject({
    "package.json": manifest,
    "src/index.ts": "export {};\n",
    "dist/index.mjs": "export {};\n",
    "dist/bin/cli.mjs": createExecutable("checkout build"),
  });

  await createBuildSources({
    root: checkout.root,
    inputs: ["package.json", "src/index.ts"],
  }).write();

  const consumer = createTemporaryProject({
    "package.json": JSON.stringify({ name: "app", type: "module" }),
    [`${store}/package.json`]: manifest,
    [`${store}/dist/index.mjs`]: "export {};\n",
    [`${store}/dist/bin/cli.mjs`]: createExecutable("installed build"),
    ...(linked
      ? {
          ".engrenage/links.json": JSON.stringify({
            fixture: {
              package: "fixture",
              directory: checkout.root,
              installed,
            },
          }),
        }
      : {}),
  });

  symlinkSync(installed, consumer.resolve("node_modules/fixture"));

  const { stdout } = await execute(
    process.execPath,
    [consumer.resolve(`${store}/dist/bin/cli.mjs`)],
    {
      cwd: consumer.root,
      env: { ...process.env, NODE_OPTIONS: undefined },
    },
  );

  return stdout.trim().split("\n").at(-1);
}

describe("loadEngrenageProgram", () => {
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
  ])(
    "a program failing to load on $stale, naming its program's debug variable",
    async ({ barrel, files, message }) => {
      const { load } = createStaleProject(barrel, files);

      const failed = load("src/main.ts");

      const error = vi.spyOn(process.stderr, "write").mockImplementation(() => {
        return true;
      });

      await loadEngrenageProgram("program", import.meta.url, () => {
        return Promise.reject(failed);
      });

      expect(process.exitCode).toBe(1);
      expect(String(error.mock.calls[0]?.[0])).toContain(message);

      expect(String(error.mock.calls[0]?.[0])).toContain("set PROGRAM_DEBUG=1");
    },
  );

  test("a program failing to load on a missing module a hand-written file imports rethrows", async () => {
    const {
      load,
    } = createStaleProject('export { a } from "#src/d/utils/a";\n', {
      "src/main.ts": 'import { gone } from "#src/d/utils/gone";\n\nvoid gone;\n',
    });

    const failed = load("src/main.ts");

    await expect(
      loadEngrenageProgram("program", import.meta.url, () => {
        return Promise.reject(failed);
      }),
    ).rejects.toBe(failed);
  });

  test("any other load failure rethrows", async () => {
    await expect(
      loadEngrenageProgram("program", import.meta.url, run),
    ).rejects.toBe(failure);
  });

  test(
    "runs the linked checkout's build instead of the installed build",
    { timeout: binaryTimeout },
    async () => {
      expect(await runInstalled(true)).toBe("checkout build");
    },
  );

  test(
    "runs the installed build without a link",
    { timeout: binaryTimeout },
    async () => {
      expect(await runInstalled(false)).toBe("installed build");
    },
  );
});
