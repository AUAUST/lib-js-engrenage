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
      "engrenage.config.ts":
        'export default { src: { baseline: "2026-10" } };\n',
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
