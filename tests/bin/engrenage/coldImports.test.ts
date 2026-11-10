import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { expect, test } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getExecutable } from "#tests/utils/getExecutable";

const run = promisify(execFile);

const recordResolutions = `
import { registerHooks } from "node:module";

registerHooks({
  resolve(specifier, context, next) {
    const resolved = next(specifier, context);

    process.stderr.write(resolved.url + "\\n");

    return resolved;
  },
});
`;

test(
  "a command that only loads the config never imports the ESLint engine",
  { timeout: binaryTimeout },
  async () => {
    const project = createTemporaryProject({
      "package.json": JSON.stringify({ name: "project", type: "module" }),
      "engrenage.config.ts": 'export default { src: { baseline: "2026-10" } };\n',
    });

    const { stderr } = await run(
      process.execPath,
      [
        "--import",
        `data:text/javascript,${encodeURIComponent(recordResolutions)}`,
        getExecutable(),
        "structure",
      ],
      { cwd: project.root },
    );

    const urls = stderr.split("\n");

    expect(urls).toContainEqual(expect.stringContaining("/valibot/"));

    expect(
      urls.filter((url) => {
        return url.includes("/node_modules/") && url.includes("eslint");
      }),
    ).toEqual([]);
  },
);

test(
  "the eager command tree never imports Git, Prettier or prompt modules",
  { timeout: binaryTimeout },
  async () => {
    const { stderr } = await run(process.execPath, [
      "--import",
      `data:text/javascript,${encodeURIComponent(recordResolutions)}`,
      getExecutable(),
      "--help",
    ]);

    const urls = stderr.split("\n");

    expect(
      urls.filter((url) => {
        return (
          url.includes("/src/tools/git/") ||
          url.includes("/src/tools/prettier/") ||
          url.includes("/@clack/prompts/")
        );
      }),
    ).toEqual([]);
  },
);

test(
  "the help of a hook group lists its commands without loading any action",
  { timeout: binaryTimeout },
  async () => {
    const { stdout, stderr } = await run(process.execPath, [
      "--import",
      `data:text/javascript,${encodeURIComponent(recordResolutions)}`,
      getExecutable(),
      "agents",
      "claude",
      "hook",
      "--help",
    ]);

    for (const name of ["dispatch", "git", "github", "stop"]) {
      expect(stdout).toContain(`  ${name} `);
    }

    expect(
      stderr.split("\n").filter((url) => {
        return url.includes("/bin/engrenage/") && url.includes("/actions/");
      }),
    ).toEqual([]);
  },
);
