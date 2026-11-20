import { afterEach, expect, test, vi } from "vitest";

import { resolveBinary } from "#foundation/processes/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { runDefinition } from "#tests/utils/runDefinition";
import { defineToolCommand } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

import type * as config from "#workflows/config/index";

vi.mock("#foundation/processes/index", async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    resolveBinary: vi.fn(),
  };
});

vi.mock("#workflows/config/index", async (importOriginal) => {
  const original = await importOriginal<typeof config>();

  return {
    ...original,
    loadValidatedConfig: vi.fn(original.loadValidatedConfig),
  };
});

afterEach(() => {
  vi.restoreAllMocks();

  process.exitCode = undefined;
});

test("loads the config with the run's reporter", async () => {
  const project = createTemporaryProject({
    "package.json": "{}",
    "tool.mjs": "",
  });

  mockCwd(project.root);
  vi.mocked(resolveBinary).mockResolvedValue(project.resolve("tool.mjs"));

  const reporter = await runDefinition(
    defineToolCommand({ packageName: "eslint" }),
  );

  const [loaded] = vi.mocked(loadValidatedConfig).mock.results;

  const config = await loaded?.value;

  expect(config?.context.reporter).toBe(reporter);
});
