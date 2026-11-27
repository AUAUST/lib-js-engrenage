import { afterEach, expect, test, vi } from "vitest";
import { parse } from "yaml";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { runDefinition } from "#tests/utils/runDefinition";

import engrenage from "#bin/engrenage/index";

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

  await runDefinition(engrenage, "sync", "pnpm", "--check");

  expect(process.exitCode).toBe(1);

  process.exitCode = undefined;

  await runDefinition(engrenage, "sync", "pnpm");

  expect(parse(project.read("pnpm-workspace.yaml"))).toEqual({
    allowBuilds: {
      "esbuild": false,
      "lefthook": false,
      "unrs-resolver": true,
    },
    minimumReleaseAgeExclude: ["@auaust/*"],
    verifyDepsBeforeRun: "error",
  });

  await runDefinition(engrenage, "sync", "pnpm", "--check");

  expect(process.exitCode).toBeUndefined();
});

test("sync keeps the stale-install policy a project sets", async () => {
  const content = 'allowBuilds:\n  esbuild: true\n  lefthook: false\n  unrs-resolver: true\nminimumReleaseAgeExclude:\n  - "@auaust/*"\nverifyDepsBeforeRun: install\n';

  const project = createTemporaryProject({
    "package.json": JSON.stringify({ name: "app", type: "module" }),
    "pnpm-workspace.yaml": content,
  });

  mockCwd(project.root);

  await runDefinition(engrenage, "sync", "pnpm", "--check");

  expect(process.exitCode).toBeUndefined();

  await runDefinition(engrenage, "sync", "pnpm");

  expect(parse(project.read("pnpm-workspace.yaml"))).toMatchObject({
    verifyDepsBeforeRun: "install",
  });
});
