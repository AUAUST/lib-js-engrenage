import { describe, expect, test, vi } from "vitest";

import { packages } from "#constants";
import { loadConfig } from "#project/config/operations/loadConfig";
import { runGateBinary } from "#project/gate/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { runGateTests } from "#tools/vitest/operations/runGateTests";

vi.mock(import("#project/gate/index"), { spy: true });

function createProject(mirror: boolean) {
  return createTemporaryProject({
    "package.json": '{ "name": "project", "type": "module" }',
    "engrenage.config.ts": `export default { tests: { mirror: ${mirror} } };\n`,
    "src/entry.ts": "",
    "src/tools/lefthook/index.ts": "",
    "src/tools/lefthook/setup/syncLefthookConfig.ts": "",
    "src/tools/eslint/index.ts": "",
    "tests/src/tools/lefthook/syncLefthookConfig.test.ts": "",
    "tests/src/tools/eslint/eslint.test.ts": "",
  });
}

describe("runGateTests", () => {
  test("runs only the tests under the changed domain's mirror directory", async () => {
    const project = createProject(true);

    vi.mocked(runGateBinary).mockResolvedValue({ ok: true, output: "" });

    const result = await runGateTests(await loadConfig(project.root), [
      "src/tools/lefthook/setup/syncLefthookConfig.ts",
    ]);

    expect(result).toEqual({ ok: true, output: "" });

    expect(vi.mocked(runGateBinary).mock.calls).toEqual([
      [
        project.root,
        packages.vitest,
        ["run", "--passWithNoTests", "tests/src/tools/lefthook/"],
      ],
    ]);
  });

  test("passes the changed files to vitest related when tests are not mirrored", async () => {
    const project = createProject(false);

    vi.mocked(runGateBinary).mockResolvedValue({ ok: true, output: "" });

    await runGateTests(await loadConfig(project.root), [
      "src/tools/lefthook/setup/syncLefthookConfig.ts",
    ]);

    expect(vi.mocked(runGateBinary).mock.calls).toEqual([
      [
        project.root,
        packages.vitest,
        [
          "related",
          "--run",
          "--passWithNoTests",
          "src/tools/lefthook/setup/syncLefthookConfig.ts",
        ],
      ],
    ]);
  });
});
