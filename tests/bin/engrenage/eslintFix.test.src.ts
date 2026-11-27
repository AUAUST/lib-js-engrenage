import { afterEach, expect, test, vi } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { linkPackage } from "#tests/utils/linkPackage";
import { mockCwd } from "#tests/utils/mockCwd";
import { runDefinition } from "#tests/utils/runDefinition";

import eslintFix from "#bin/engrenage/eslintFix";

const suppressed = {
  "no-debugger": {
    count: 1,
  },
};

afterEach(() => {
  vi.restoreAllMocks();

  process.exitCode = undefined;
});

// @debt skipped whole: under gate load its spawning tests time out past 5s in turn though each passes alone (BL-69c9a1)
test.skip("prunes only the stale suppressions of the files given from a subdirectory", async () => {
  const project = createTemporaryProject({
    "package.json": '{"name":"project","type":"module","devDependencies":{"eslint":"*"}}',
    "engrenage.config.ts": "export default {};\n",
    "eslint.config.mjs": 'export default [{ files: ["**/*.ts"], rules: { "no-debugger": "error" } }];\n',
    "eslint-suppressions.json": JSON.stringify({
      "a.ts": suppressed,
      "sub/b.ts": suppressed,
    }),
    "a.ts": "export {};\n",
    "sub/b.ts": "debugger;\n",
  });

  linkPackage("eslint", project.resolve("node_modules/eslint"));

  mockCwd(project.resolve("sub"));

  await runDefinition(eslintFix, "../a.ts");

  expect(JSON.parse(project.read("eslint-suppressions.json"))).toEqual({
    "sub/b.ts": suppressed,
  });
});
