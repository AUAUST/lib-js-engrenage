import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { expect, test } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";

const run = promisify(execFile);

const repositoryRoot = fileURLToPath(new URL("../../../../", import.meta.url));

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
  "the ESLint options schema loads the conventions without the plugins they only delegate to",
  { timeout: binaryTimeout },
  async () => {
    const { stderr } = await run(
      process.execPath,
      [
        "--import",
        `data:text/javascript,${encodeURIComponent(recordResolutions)}`,
        "--input-type=module",
        "--eval",
        'await import("#tools/eslint/config/schemas/optionsSchema");',
      ],
      { cwd: repositoryRoot },
    );

    const urls = stderr.split("\n");

    expect(urls).toContainEqual(
      expect.stringContaining("/conventions/comparisons/noLooseEqual.ts"),
    );

    expect(
      urls.filter((url) => url.includes("/eslint-plugin-unicorn/")),
    ).toEqual([]);
  },
);
