import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { parse } from "yaml";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";

import sync from "#bin/engrenage/actions/sync";

beforeEach(() => {
  vi.spyOn(console, "info").mockImplementation(() => {});
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

  await sync(["pnpm"], {
    check: true,
    values: {},
  });

  expect(process.exitCode).toBe(1);

  process.exitCode = undefined;

  await sync(["pnpm"], {
    check: false,
    values: {},
  });

  expect(parse(project.read("pnpm-workspace.yaml"))).toEqual({
    allowBuilds: { "esbuild": false, "unrs-resolver": true },
    minimumReleaseAgeExclude: ["@auaust/*"],
  });

  await sync(["pnpm"], {
    check: true,
    values: {},
  });

  expect(process.exitCode).toBeUndefined();
});
