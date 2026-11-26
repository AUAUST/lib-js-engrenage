import { afterEach, expect, test, vi } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { runCommand } from "#tests/utils/runCommand";

import sync from "#bin/engrenage/sync";

afterEach(() => {
  vi.restoreAllMocks();

  process.exitCode = undefined;
});

async function syncPrepare(scripts: Record<string, string>, config = "{}") {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "app",
      type: "module",
      scripts,
    }),
    "engrenage.config.ts": `export default ${config};`,
  });

  mockCwd(project.root);

  await runCommand("sync", sync, "prepare");

  const { scripts: synced } = JSON.parse(project.read("package.json")) as {
    scripts: Record<string, string>;
  };

  return synced["prepare"];
}

test("sync makes prepare restore links after the project's own command, once", async () => {
  expect(await syncPrepare({})).toBe("pnpm engrenage link --restore");

  expect(await syncPrepare({ prepare: "lefthook install" })).toBe(
    "lefthook install && pnpm engrenage link --restore",
  );

  expect(
    await syncPrepare({
      prepare: "pnpm engrenage link --restore && lefthook install",
    }),
  ).toBe("pnpm engrenage link --restore && lefthook install");

  expect(await syncPrepare({ prepare: "engrenage link --restore" })).toBe(
    "engrenage link --restore",
  );
});

test("sync makes prepare restore links in a published package too", async () => {
  expect(
    await syncPrepare({ prepare: "lefthook install" }, '{ preset: "library" }'),
  ).toBe("lefthook install && pnpm engrenage link --restore");
});
