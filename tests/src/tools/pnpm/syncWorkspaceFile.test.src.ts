import { afterEach, expect, test, vi } from "vitest";
import { parse } from "yaml";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { runDefinition } from "#tests/utils/runDefinition";
import { defineGroup } from "#workflows/cli/index";

import sync from "#bin/engrenage/sync";

const program = defineGroup({
  commands: { sync },
});

afterEach(() => {
  vi.restoreAllMocks();

  process.exitCode = undefined;
});

test("sync adds missing shared workspace settings and keeps explicit denials", async () => {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ name: "app", type: "module" }),
    "pnpm-workspace.yaml": "allowBuilds:\n  esbuild: false\n",
  });

  mockCwd(project.root);

  await runDefinition(program, "sync", "pnpm", "--check");

  expect(process.exitCode).toBe(1);

  process.exitCode = undefined;

  await runDefinition(program, "sync", "pnpm");

  expect(parse(project.read("pnpm-workspace.yaml"))).toEqual({
    allowBuilds: {
      "esbuild": false,
      "lefthook": false,
      "unrs-resolver": true,
    },
    minimumReleaseAgeExclude: ["@auaust/*"],
  });

  await runDefinition(program, "sync", "pnpm", "--check");

  expect(process.exitCode).toBeUndefined();
});
