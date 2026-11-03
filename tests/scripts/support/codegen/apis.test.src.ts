import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { apis } from "#scripts/support/codegen/apis";
import { binaryTimeout } from "#tests/helpers/binaryTimeout";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { mockCwd } from "#tests/helpers/mockCwd";
import { runCommand } from "#tests/helpers/runCommand";

function createProject(files: Record<string, string> = {}) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({}),
    ...files,
  });

  mockCwd(project.root);

  return project;
}

beforeEach(() => {
  vi.spyOn(console, "info").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("support codegen apis", { timeout: binaryTimeout }, () => {
  test("generates the timers group from the declarations of the DOM lib", async () => {
    const project = createProject();

    await runCommand(apis, "timers");

    const content = project.read("data/apis/timers.d.ts");

    expect(content).toContain("declare function setTimeout(");
    expect(content).toContain("declare function setInterval(");
    expect(content).toContain("declare function clearTimeout(");
    expect(content).toContain("declare function clearInterval(");
    expect(content).toContain("type TimerHandler");
    expect(content).not.toContain("interface Window");
    expect(content).not.toContain("DOMHighResTimeStamp");
  });

  test("fails the check on an edited group", async () => {
    const project = createProject({
      "data/apis/timers.d.ts": "declare const edited: 1;\n",
    });

    await runCommand(apis, "timers", "--check");

    expect(process.exitCode).toBe(1);

    expect(project.read("data/apis/timers.d.ts")).toBe(
      "declare const edited: 1;\n",
    );
  });
});
